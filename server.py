#!/usr/bin/env python3
import json
import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
TRIPS_JSON = os.path.join(DATA_DIR, 'trips.json')
MAINT_JSON = os.path.join(DATA_DIR, 'maintenance.json')
TRIPS_CSV = os.path.join(DATA_DIR, 'trips.csv')
MAINT_CSV = os.path.join(DATA_DIR, 'maintenance.csv')

os.makedirs(DATA_DIR, exist_ok=True)
for path in (TRIPS_JSON, MAINT_JSON):
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            f.write('[]')


def append_json(path, record):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            arr = json.load(f)
    except Exception:
        arr = []
    arr.append(record)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(arr, f, ensure_ascii=False, indent=2)


def ensure_csv_header(path, header):
    exists = os.path.exists(path)
    if not exists:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(','.join(header) + '\n')


def append_csv(path, header, row_dict):
    ensure_csv_header(path, header)
    row = []
    for h in header:
        val = row_dict.get(h, '')
        # escape commas/quotes/newlines
        s = str(val)
        if any(c in s for c in [',', '"', '\n']):
            s = '"' + s.replace('"', '""') + '"'
        row.append(s)
    with open(path, 'a', encoding='utf-8') as f:
        f.write(','.join(row) + '\n')


def read_json_array(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []


class ArchiveHandler(SimpleHTTPRequestHandler):
    def _set_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_GET(self):
        path = self.path.split('?')[0]
        if path == '/api/trips':
            data = read_json_array(TRIPS_JSON)
            body = json.dumps(data, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors()
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == '/api/maintenance':
            data = read_json_array(MAINT_JSON)
            body = json.dumps(data, ensure_ascii=False).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors()
            self.send_header('Content-Length', len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', '0'))
        body = self.rfile.read(length) if length else b''
        path = self.path
        try:
            data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            self.send_response(400)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'Invalid JSON')
            return

        if path == '/api/save_trip':
            append_json(TRIPS_JSON, data)
            # CSV projection for trips
            trip_header = [
                'date','driverName','tripName','startKms','endKms','totalKms',
                'rentalFee','fuelExpense','tripExpense','driverBata','companyRevenue','creditedTo','notes'
            ]
            append_csv(TRIPS_CSV, trip_header, data)
            self.send_response(200)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'ok')
            return
        elif path == '/api/save_maintenance':
            append_json(MAINT_JSON, data)
            maint_header = ['date','stakeholder','description','cost']
            append_csv(MAINT_CSV, maint_header, data)
            self.send_response(200)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'ok')
            return
        elif path == '/api/update_trip':
            update_json(TRIPS_JSON, data)
            self.send_response(200)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'ok')
            return
        elif path == '/api/delete_trip':
            rid = (data.get('id') if isinstance(data, dict) else None)
            if rid is None:
                self.send_response(400)
                self._set_cors()
                self.end_headers()
                self.wfile.write(b'id required')
                return
            delete_json(TRIPS_JSON, rid)
            self.send_response(200)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'ok')
            return
        elif path == '/api/update_maintenance':
            update_json(MAINT_JSON, data)
            self.send_response(200)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'ok')
            return
        elif path == '/api/delete_maintenance':
            rid = (data.get('id') if isinstance(data, dict) else None)
            if rid is None:
                self.send_response(400)
                self._set_cors()
                self.end_headers()
                self.wfile.write(b'id required')
                return
            delete_json(MAINT_JSON, rid)
            self.send_response(200)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'ok')
            return
        else:
            self.send_response(404)
            self._set_cors()
            self.end_headers()
            self.wfile.write(b'Not Found')


def update_json(path, record):
    rid = str(record.get('id', ''))
    try:
        with open(path, 'r', encoding='utf-8') as f:
            arr = json.load(f)
    except Exception:
        arr = []
    if rid:
        updated = False
        for i, r in enumerate(arr):
            if str(r.get('id', '')) == rid:
                arr[i] = { **r, **record }
                updated = True
                break
        if not updated:
            arr.append(record)
    else:
        arr.append(record)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(arr, f, ensure_ascii=False, indent=2)


def delete_json(path, rid):
    rid = str(rid)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            arr = json.load(f)
    except Exception:
        arr = []
    arr = [r for r in arr if str(r.get('id', '')) != rid]
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(arr, f, ensure_ascii=False, indent=2)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8010'))
    server = HTTPServer(('localhost', port), ArchiveHandler)
    print(f"Archive server running on http://localhost:{port} (writes to {DATA_DIR})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down...')
        server.server_close()
