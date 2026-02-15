# Google Sheet setup (Option 1: same driver form → Sheet)

Your **existing driver form** (same fields, Total KMs and Company Revenue auto-calculated) stays as-is. Submissions are sent to a Google Sheet so you can view them in the dashboard from anywhere, without running a local server.

---

## 1. Create the Sheet and tabs

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet (e.g. "Car Rental Tracker").
2. Keep the first sheet and **rename** it to **`Trips`** (exact name).
3. Add a second sheet: **+** at the bottom → rename it to **`Maintenance`** (exact name).

---

## 2. Trips sheet – headers (Row 1)

In the **Trips** sheet, set **Row 1** to these column headers (one per cell):

| A   | B    | C          | D        | E        | F       | G        | H        | I         | J        | K     | L          | M         | N           | O            | P            | Q               | R          | S             | T      |
|-----|------|------------|----------|----------|---------|----------|----------|-----------|----------|-------|------------|-----------|-------------|--------------|--------------|-----------------|------------|---------------|--------|
| id  | date | driverName | tripName | startKms | endKms  | totalKms | mileage  | startDate | endDate  | notes | creditedTo | rentalFee  | fuelExpense  | tripExpense  | driverBata   | companyRevenue | totalExpenses | profit | (optional) |

(You can add more columns later; the script uses these names.)

---

## 3. Maintenance sheet – headers (Row 1)

In the **Maintenance** sheet, set **Row 1** to:

| A   | B    | C           | D           | E    |
|-----|------|-------------|-------------|------|
| id  | date | stakeholder | description | cost |

---

## 4. Add the Apps Script

1. In the spreadsheet: **Extensions** → **Apps Script**.
2. Delete any sample code in `Code.gs`.
3. Copy the **entire** contents of the file **`google-apps-script.js`** from this project (in the repo root) and paste into `Code.gs`.
4. Click **Save** (disk icon). Name the project if asked (e.g. "Car Rental Sheet API").

---

## 5. Deploy as Web App

1. In Apps Script: **Deploy** → **New deployment**.
2. Click the gear icon next to **Select type** → choose **Web app**.
3. Set:
   - **Description:** e.g. "Car Rental API"
   - **Execute as:** **Me** (your Google account)
   - **Who has access:** **Anyone** (so the app can call it from GitHub Pages or any browser)
4. Click **Deploy**. Authorize the app when prompted (choose your Google account, allow permissions).
5. Copy the **Web app URL** (looks like `https://script.google.com/macros/s/XXXXXXXXXX/exec`). You will paste this into the app config.

---

## 6. Connect the app to the Sheet

1. Open **`app.js`** in this project.
2. Find the line that sets **`GOOGLE_SCRIPT_URL`** (near the top).
3. Set it to your Web app URL, for example:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXX/exec';
   ```
4. Save and deploy your app (e.g. push to GitHub so GitHub Pages uses the new code).

---

## How it works

- **Driver** (from anywhere): Opens your app (e.g. GitHub Pages link) → **Driver form** → same fields and auto-calculation (Total KMs, Company Revenue) → Submit. The app sends the trip to your Google Sheet via the script URL.
- **You (admin):** Open the app → **Admin** → Dashboard loads trips and maintenance from the same Sheet, so you see all driver submissions and your maintenance entries.
- **New trips and new maintenance** are written to the Sheet. Edit/delete in the dashboard currently affect only the data loaded in the browser; the next time you open the dashboard it will reload from the Sheet. To remove or fix a row permanently, you can edit or delete it in the Google Sheet itself.

No local server needed. The **form stays the same**; only the save destination (and dashboard data source) uses the Sheet when `GOOGLE_SCRIPT_URL` is set.

---

## Optional: use only the form link

Share the **Driver form** page link with drivers, e.g.:

`https://YOUR_USERNAME.github.io/vehicle-rental-tracker/driver.html`

They use the same form and same auto-calculation; submissions go to the Sheet.
