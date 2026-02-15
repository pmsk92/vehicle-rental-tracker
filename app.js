// Firebase disabled: use localStorage only
let firebaseEnabled = false;
let db, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, updateDoc;

// Storage keys (for localStorage fallback)
const TRIPS_KEY = 'carRentalTrips';
const MAINTENANCE_KEY = 'carRentalMaintenance';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Exotic@2025';
const RECOVERY_EMAIL = 'saratheie2015@gmail.com';
const LOGIN_KEY = 'carRentalAdminLoggedIn';

// Google Sheet (Option 1): set to your Apps Script Web App URL to save/load from Sheet. Leave '' to disable.
// Example: 'https://script.google.com/macros/s/XXXXXXXXXX/exec'
const GOOGLE_SCRIPT_URL = '';

// Initialize data storage
function initStorage() {
    if (!localStorage.getItem(TRIPS_KEY)) {
        localStorage.setItem(TRIPS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(MAINTENANCE_KEY)) {
        localStorage.setItem(MAINTENANCE_KEY, JSON.stringify([]));
    }
}

// Data folder API: when server is running (e.g. server.py on 8010), use it; else localStorage
const ARCHIVE_BASE = (typeof window !== 'undefined' && window.location.port === '8010') ? '' : 'http://localhost:8010';

async function sendToArchive(path, payload) {
    try {
        await fetch(`${ARCHIVE_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.warn('Archive POST failed:', err);
    }
}

// Get data: Firebase > Google Sheet > data folder (server) > localStorage
async function getTrips() {
    if (firebaseEnabled) {
        try {
            const q = query(collection(db, 'trips'), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(t => !t.deleted);
        } catch (e) {
            console.error("Error fetching trips:", e);
            return [];
        }
    }
    if (GOOGLE_SCRIPT_URL) {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=trips`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    localStorage.setItem(TRIPS_KEY, JSON.stringify(data));
                    return data;
                }
            }
        } catch (e) { /* Sheet not available */ }
    }
    if (ARCHIVE_BASE !== undefined) {
        try {
            const res = await fetch(`${ARCHIVE_BASE}/api/trips`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    localStorage.setItem(TRIPS_KEY, JSON.stringify(data));
                    return data;
                }
            }
        } catch (e) { /* server not running, use localStorage */ }
    }
    return JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
}

async function getMaintenance() {
    if (firebaseEnabled) {
        try {
            const q = query(collection(db, 'maintenance'), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(m => !m.deleted);
        } catch (e) {
            console.error("Error fetching maintenance:", e);
            return [];
        }
    }
    if (GOOGLE_SCRIPT_URL) {
        try {
            const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=maintenance`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(data));
                    return data;
                }
            }
        } catch (e) { /* Sheet not available */ }
    }
    if (ARCHIVE_BASE !== undefined) {
        try {
            const res = await fetch(`${ARCHIVE_BASE}/api/maintenance`);
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(data));
                    return data;
                }
            }
        } catch (e) { /* server not running, use localStorage */ }
    }
    return JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || '[]');
}

// Save data to Firebase or localStorage
async function saveTrip(trip) {
    const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
    // Assign local ID for per-row actions
    if (!trip.id) {
        trip.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    trips.push(trip);
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
    sendToArchive('/api/save_trip', trip);
    if (GOOGLE_SCRIPT_URL) {
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'trip', data: trip })
            });
        } catch (err) { console.warn('Google Sheet save failed:', err); }
    }
    return true;
}

async function saveMaintenance(maintenance) {
    const maintenanceList = JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || '[]');
    // Assign local ID for per-row actions
    if (!maintenance.id) {
        maintenance.id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    maintenanceList.push(maintenance);
    localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(maintenanceList));
    sendToArchive('/api/save_maintenance', maintenance);
    if (GOOGLE_SCRIPT_URL) {
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'maintenance', data: maintenance })
            });
        } catch (err) { console.warn('Google Sheet save failed:', err); }
    }
    return true;
}




// Driver Form Submission
if (document.getElementById('driverForm')) {
    const form = document.getElementById('driverForm');

    // Auto-calculate Total KMs based on start/end inputs
    const startInput = document.getElementById('startKms');
    const endInput = document.getElementById('endKms');
    const totalKmsInput = document.getElementById('totalKms');
    // Auto-calculate Company Revenue based on fee/expenses
    const rentalFeeInput = document.getElementById('rentalFee');
    const fuelExpenseInput = document.getElementById('fuelExpense');
    const tripExpenseInput = document.getElementById('tripExpense');
    const driverBataInput = document.getElementById('driverBata');
    const companyRevenueInput = document.getElementById('companyRevenue');

    function updateTotalKms() {
        const start = parseFloat(startInput.value);
        const end = parseFloat(endInput.value);
        if (!isNaN(start) && !isNaN(end)) {
            const diff = end - start;
            totalKmsInput.value = isFinite(diff) ? Math.max(0, diff) : '';
        } else {
            totalKmsInput.value = '';
        }
    }

    startInput.addEventListener('input', updateTotalKms);
    endInput.addEventListener('input', updateTotalKms);

    function allFourEntered() {
        const values = [rentalFeeInput?.value, fuelExpenseInput?.value, tripExpenseInput?.value, driverBataInput?.value];
        return values.every(v => v !== '' && !isNaN(Number(v)));
    }
    function updateCompanyRevenue() {
        if (!allFourEntered()) {
            if (companyRevenueInput) companyRevenueInput.value = '';
            return;
        }
        const fee = Number(rentalFeeInput.value);
        const fuel = Number(fuelExpenseInput.value);
        const trip = Number(tripExpenseInput.value);
        const bata = Number(driverBataInput.value);
        const rev = fee - (fuel + trip + bata);
        if (companyRevenueInput) companyRevenueInput.value = isFinite(rev) ? Math.round(rev) : '';
    }
    [rentalFeeInput, fuelExpenseInput, tripExpenseInput, driverBataInput].forEach(el => {
        if (el) {
            el.addEventListener('input', updateCompanyRevenue);
            el.addEventListener('keyup', updateCompanyRevenue);
            el.addEventListener('change', updateCompanyRevenue);
        }
    });
    // Initialize immediately on load so a prefilled form shows the value
    updateCompanyRevenue();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate dates
        const startDateVal = document.getElementById('startDate').value;
        const endDateVal = document.getElementById('endDate').value;
        if (!startDateVal || !endDateVal) {
            alert('Please select both Start and End dates.');
            return;
        }
        const startDate = new Date(startDateVal);
        const endDate = new Date(endDateVal);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
            alert('End Date must be on or after Start Date.');
            return;
        }
        const startDateISO = startDate.toISOString();
        const endDateISO = endDate.toISOString();

        const startKms = parseFloat(document.getElementById('startKms').value);
        const endKms = parseFloat(document.getElementById('endKms').value);
        if (isNaN(startKms) || isNaN(endKms) || endKms < startKms) {
            alert('Please ensure End KMs is greater than or equal to Start KMs.');
            return;
        }
        const rentalFee = parseFloat(document.getElementById('rentalFee').value);
        const creditedTo = document.getElementById('creditedTo')?.value;
        const fuelExpense = parseFloat(document.getElementById('fuelExpense').value);
        const tripExpense = parseFloat(document.getElementById('tripExpense').value);
        const driverBata = parseFloat(document.getElementById('driverBata').value);
        // Integer validations
        const intFields = [
            {name: 'Start KMs', value: startKms},
            {name: 'End KMs', value: endKms},
            {name: 'Rental Fee', value: rentalFee},
            {name: 'Fuel Expense', value: fuelExpense},
            {name: 'Trip Expense', value: tripExpense},
            {name: 'Driver Bata', value: driverBata},
        ];
        for (const f of intFields) {
            if (!Number.isInteger(f.value)) {
                alert(`${f.name} must be an integer.`);
                return;
            }
        }
        
        const totalKms = endKms - startKms;
        const totalExpenses = fuelExpense + tripExpense + driverBata;
        const companyRevenue = rentalFee - totalExpenses;
        const profit = companyRevenue;

        // Ensure rental fee covers expenses (non-negative company revenue)
        if (rentalFee < totalExpenses) {
            alert('Rental Fee must be greater than or equal to the sum of Fuel, Trip Expense, and Driver Bata.');
            return;
        }
        
        const notesRaw = (document.getElementById('driverNotes')?.value || '').trim();
        const notesLines = notesRaw.split(/\r?\n/).slice(0, 5);
        const trip = {
            date: endDateISO,
            driverName: document.getElementById('driverName').value,
            tripName: document.getElementById('tripName').value,
            startKms: startKms,
            endKms: endKms,
            totalKms: totalKms,
            // Mileage field replaced by Total KMs display; store kms for completeness
            mileage: totalKms,
            startDate: startDateISO,
            endDate: endDateISO,
            notes: notesLines.join('\n'),
            creditedTo: creditedTo,
            rentalFee: rentalFee,
            fuelExpense: fuelExpense,
            tripExpense: tripExpense,
            companyRevenue: companyRevenue,
            driverBata: driverBata,
            totalExpenses: totalExpenses,
            profit: profit
        };
        
        // Save trip
        const success = await saveTrip(trip);
        
        if (success) {
            // Show success message
            document.getElementById('successMessage').style.display = 'block';
            form.reset();
            
            setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
            }, 3000);
        } else {
            alert('Error saving trip. Please try again.');
        }
    });
}

// Admin Login
if (document.getElementById('loginForm')) {
    // Check if already logged in
    if (sessionStorage.getItem(LOGIN_KEY) === 'true') {
        showDashboard();
    }
    
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem(LOGIN_KEY, 'true');
            showDashboard();
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
        }
    });
}

async function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';
    initStorage();
    await populateMonthFilter();
    const select = document.getElementById('monthFilter');
    // Default to All Time view
    select.value = 'all';
    document.getElementById('monthFilter').addEventListener('change', loadDashboard);
    loadDashboard();
}

function logout() {
    sessionStorage.removeItem(LOGIN_KEY);
}

// Admin Dashboard
if (document.getElementById('maintenanceForm')) {
    // Maintenance Form Submission
    const maintenanceForm = document.getElementById('maintenanceForm');
    maintenanceForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const dateVal = document.getElementById('maintenanceDate').value;
        const stakeholderVal = document.getElementById('maintenanceStakeholder').value;
        const costVal = parseFloat(document.getElementById('maintenanceCost').value);
        if (!dateVal) {
            alert('Please select a maintenance date.');
            return;
        }
        if (!stakeholderVal) {
            alert('Please select a stakeholder.');
            return;
        }
        if (!Number.isInteger(costVal)) {
            alert('Maintenance Cost must be an integer.');
            return;
        }

        const maintenance = {
            date: new Date(dateVal).toISOString(),
            stakeholder: stakeholderVal,
            description: document.getElementById('maintenanceDesc').value,
            cost: costVal
        };
        
        await saveMaintenance(maintenance);
        maintenanceForm.reset();
        loadDashboard();
    });
}


async function loadDashboard() {
    const trips = await getTrips();
    const maintenance = await getMaintenance();
    const selectedMonth = document.getElementById('monthFilter').value;
    
    // Filter by month if selected
    let filteredTrips = trips;
    let filteredMaintenance = maintenance;
    
    if (selectedMonth !== 'all') {
        filteredTrips = trips.filter(trip => {
            const tripDate = new Date(trip.endDate || trip.date);
            return `${tripDate.getFullYear()}-${String(tripDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
        });
        
        filteredMaintenance = maintenance.filter(m => {
            const mDate = new Date(m.date);
            return `${mDate.getFullYear()}-${String(mDate.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
        });
    }
    
    // Calculate totals
    const totalRevenue = filteredTrips.reduce((sum, trip) => sum + trip.rentalFee, 0);
    const totalTripExpenses = filteredTrips.reduce((sum, trip) => sum + trip.totalExpenses, 0);
    const totalMaintenanceExpenses = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenses = totalTripExpenses + totalMaintenanceExpenses;
    const netProfit = totalRevenue - totalExpenses;
    
    // Revenue credited per partner (from trips)
    const revenueVimal = filteredTrips.filter(t => (t.creditedTo || '').toLowerCase() === 'vimal').reduce((sum, t) => sum + t.rentalFee, 0);
    const revenueSarath = filteredTrips.filter(t => (t.creditedTo || '').toLowerCase() === 'sarath').reduce((sum, t) => sum + t.rentalFee, 0);
    
    // Update stats
    document.getElementById('totalRevenue').textContent = `₹${totalRevenue.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('netProfit').textContent = `₹${netProfit.toFixed(2)}`;
    document.getElementById('netProfit').className = netProfit >= 0 ? 'stat-value profit-positive' : 'stat-value profit-negative';
    document.getElementById('totalTrips').textContent = filteredTrips.length;

    // Profit share calculation:
    // Split net profit 50/50, then equalize maintenance contributions.
    // Each partner should effectively bear half of total maintenance.
    const vimalExpenses = filteredMaintenance.filter(m => (m.stakeholder || '').toLowerCase() === 'vimal').reduce((sum, m) => sum + m.cost, 0);
    const sarathExpenses = filteredMaintenance.filter(m => (m.stakeholder || '').toLowerCase() === 'sarath').reduce((sum, m) => sum + m.cost, 0);
    const halfMaintenance = totalMaintenanceExpenses / 2;
    const baseShare = netProfit / 2;
    const vShare = baseShare + (vimalExpenses - halfMaintenance);
    const sShare = baseShare + (sarathExpenses - halfMaintenance);
    document.getElementById('profitShareVimal').textContent = `₹${vShare.toFixed(2)}`;
    document.getElementById('profitShareSarath').textContent = `₹${sShare.toFixed(2)}`;
    const vDelta = vimalExpenses - halfMaintenance;
    const sDelta = sarathExpenses - halfMaintenance;
    function fmtAdj(amount) {
        const sign = amount >= 0 ? '+' : '-';
        return `${sign}₹${Math.abs(amount).toFixed(2)} ${amount >= 0 ? 'from partner' : 'to partner'}`;
    }
    const vAdjEl = document.getElementById('profitAdjustVimal');
    const sAdjEl = document.getElementById('profitAdjustSarath');
    if (vAdjEl) vAdjEl.textContent = `Maintenance Equalization ${fmtAdj(vDelta)}`;
    if (sAdjEl) sAdjEl.textContent = `Maintenance Equalization ${fmtAdj(sDelta)}`;

    // Settlement based on credited revenue minus maintenance, to reach baseShare
    const cashV = revenueVimal - vimalExpenses;
    const cashS = revenueSarath - sarathExpenses;
    const settleV = baseShare - cashV; // + means receive from partner, - means pay to partner
    const settleS = baseShare - cashS;
    const vSettleEl = document.getElementById('settlementVimal');
    const sSettleEl = document.getElementById('settlementSarath');
    if (vSettleEl) vSettleEl.textContent = `Settlement ${fmtAdj(settleV)}`;
    if (sSettleEl) sSettleEl.textContent = `Settlement ${fmtAdj(settleS)}`;
    
    // Load trips table
    loadTripsTable(filteredTrips);
    
    // Load maintenance table
    loadMaintenanceTable(filteredMaintenance);

}

function loadTripsTable(trips) {
    const tbody = document.getElementById('tripsTableBody');
    if (!tbody) return;

    if (trips.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No trips recorded yet</td></tr>';
        return;
    }

    trips.sort((a, b) => new Date(b.endDate || b.date) - new Date(a.endDate || a.date));

    tbody.innerHTML = trips.map(function (trip) {
        var start = new Date(trip.startDate || trip.date);
        var end = new Date(trip.endDate || trip.date);
        var days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
        var fee = typeof trip.rentalFee === 'number' ? trip.rentalFee.toFixed(2) : (trip.rentalFee || '0.00');
        var profit = trip.profit != null ? trip.profit : trip.companyRevenue;
        var profitVal = typeof profit === 'number' ? profit.toFixed(2) : '0.00';
        var profitClass = (profit != null && profit >= 0) ? 'profit-positive' : 'profit-negative';
        var safeId = String(trip.id || '').replace(/'/g, "\\'");
        return '<tr>' +
            '<td>' + start.toLocaleDateString() + '</td>' +
            '<td>' + end.toLocaleDateString() + '</td>' +
            '<td>' + days + '</td>' +
            '<td>₹' + fee + '</td>' +
            '<td class="' + profitClass + '">₹' + profitVal + '</td>' +
            '<td class="td-actions"><div class="action-buttons">' +
            '<button class="btn btn-secondary btn-sm" onclick="editTrip(\'' + safeId + '\')">Edit</button> ' +
            '<button class="btn btn-delete btn-sm" onclick="deleteTrip(\'' + safeId + '\')">Delete</button>' +
            '</div></td></tr>';
    }).join('');
}

function loadMaintenanceTable(maintenance) {
    const tbody = document.getElementById('maintenanceTableBody');
    
    if (maintenance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No maintenance expenses yet</td></tr>';
        return;
    }
    
    // Sort by date (newest first)
    maintenance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = maintenance.map(function (m) {
        var safeId = String(m.id || '').replace(/'/g, "\\'");
        return '<tr>' +
            '<td>' + new Date(m.date).toLocaleDateString() + '</td>' +
            '<td>' + (m.stakeholder || '') + '</td>' +
            '<td>' + (m.description || '') + '</td>' +
            '<td>₹' + (typeof m.cost === 'number' ? m.cost.toFixed(2) : m.cost) + '</td>' +
            '<td class="td-actions"><div class="action-buttons">' +
            '<button class="btn btn-secondary btn-sm" onclick="editMaintenance(\'' + safeId + '\')">Edit</button> ' +
            '<button class="btn btn-delete btn-sm" onclick="deleteMaintenance(\'' + safeId + '\')">Delete</button>' +
            '</div></td></tr>';
    }).join('');
}


async function populateMonthFilter() {
    const trips = await getTrips();
    const maintenance = await getMaintenance();
    const allDates = [
        ...trips.map(t => new Date(t.endDate || t.date)),
        ...maintenance.map(m => new Date(m.date))
    ];
    
    if (allDates.length === 0) return;
    
    const months = new Set();
    allDates.forEach(date => {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthKey);
    });
    
    const sortedMonths = Array.from(months).sort().reverse();
    const select = document.getElementById('monthFilter');
    
    sortedMonths.forEach(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(year, monthNum - 1);
        const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const option = document.createElement('option');
        option.value = month;
        option.textContent = monthName;
        select.appendChild(option);

        // Month tabs removed; dropdown controls the view
    });
}

async function deleteTrip(id) {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    
    if (firebaseEnabled) {
        try {
            // Soft delete: mark as deleted, do not erase backend record
            await updateDoc(doc(db, 'trips', id), { deleted: true, deletedAt: new Date().toISOString() });
        } catch (e) {
            console.error("Error soft-deleting trip:", e);
        }
    } else {
        const trips = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
        const filtered = trips.filter(trip => String(trip.id) !== String(id));
        localStorage.setItem(TRIPS_KEY, JSON.stringify(filtered));
        // Archive delete
        sendToArchive('/api/delete_trip', { id });
    }
    loadDashboard();
}

async function deleteMaintenance(id) {
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    
    if (firebaseEnabled) {
        try {
            // Soft delete: mark as deleted
            await updateDoc(doc(db, 'maintenance', id), { deleted: true, deletedAt: new Date().toISOString() });
        } catch (e) {
            console.error("Error soft-deleting maintenance:", e);
        }
    } else {
        const maintenance = JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || '[]');
        const filtered = maintenance.filter(m => String(m.id) !== String(id));
        localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(filtered));
        // Archive delete
        sendToArchive('/api/delete_maintenance', { id });
    }
    loadDashboard();
}

// Edit Trip (supports Firebase and localStorage)
let editingTripId = null;
async function editTrip(id) {
    const editSection = document.getElementById('editTripSection');
    const form = document.getElementById('editTripForm');
    if (!editSection || !form) return;

    const trips = await getTrips();
    const trip = trips.find(t => String(t.id) === String(id));
    if (!trip) return alert('Trip not found.');

    editingTripId = id;
    document.getElementById('editDriverName').value = trip.driverName || '';
    document.getElementById('editTripName').value = trip.tripName || '';
    document.getElementById('editStartKms').value = trip.startKms ?? '';
    document.getElementById('editEndKms').value = trip.endKms ?? '';
    document.getElementById('editRentalFee').value = trip.rentalFee ?? '';
    document.getElementById('editFuelExpense').value = trip.fuelExpense ?? '';
    document.getElementById('editTripExpense').value = trip.tripExpense ?? 0;
    document.getElementById('editDriverBata').value = trip.driverBata ?? 0;
    document.getElementById('editCreditedTo').value = trip.creditedTo || 'Vimal';
    document.getElementById('editTotalKms').value = Math.max(0, (trip.endKms || 0) - (trip.startKms || 0));
    const totalExpenses = (trip.fuelExpense || 0) + (trip.tripExpense || 0) + (trip.driverBata || 0);
    const companyRevenue = (trip.rentalFee || 0) - totalExpenses;
    document.getElementById('editCompanyRevenue').value = isFinite(companyRevenue) ? Math.round(companyRevenue) : '';

    editSection.style.display = 'block';
}

// Wire up edit form when present
if (document.getElementById('editTripForm')) {
    const startEl = document.getElementById('editStartKms');
    const endEl = document.getElementById('editEndKms');
    const totalEl = document.getElementById('editTotalKms');
    const rentalEl = document.getElementById('editRentalFee');
    const fuelEl = document.getElementById('editFuelExpense');
    const tripEl = document.getElementById('editTripExpense');
    const bataEl = document.getElementById('editDriverBata');
    const companyEl = document.getElementById('editCompanyRevenue');
    function updateEditTotal() {
        const s = parseFloat(startEl.value);
        const e = parseFloat(endEl.value);
        if (!isNaN(s) && !isNaN(e)) {
            totalEl.value = Math.max(0, e - s);
        } else {
            totalEl.value = '';
        }
    }
    startEl.addEventListener('input', updateEditTotal);
    endEl.addEventListener('input', updateEditTotal);

    function updateEditCompanyRevenue() {
        const values = [rentalEl.value, fuelEl.value, tripEl.value, bataEl.value];
        if (values.some(v => v === '' || isNaN(Number(v)))) {
            if (companyEl) companyEl.value = '';
            return;
        }
        const fee = Number(rentalEl.value);
        const fuel = Number(fuelEl.value);
        const trip = Number(tripEl.value);
        const bata = Number(bataEl.value);
        const rev = fee - (fuel + trip + bata);
        if (companyEl) companyEl.value = isFinite(rev) ? Math.round(rev) : '';
    }
    [rentalEl, fuelEl, tripEl, bataEl].forEach(el => {
        if (el) {
            el.addEventListener('input', updateEditCompanyRevenue);
            el.addEventListener('keyup', updateEditCompanyRevenue);
            el.addEventListener('change', updateEditCompanyRevenue);
        }
    });

    const cancelBtn = document.getElementById('editCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('editTripSection').style.display = 'none';
            editingTripId = null;
        });
    }

    document.getElementById('editTripForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!editingTripId) return;

        const updated = {
            driverName: document.getElementById('editDriverName').value,
            tripName: document.getElementById('editTripName').value,
            startKms: parseFloat(document.getElementById('editStartKms').value),
            endKms: parseFloat(document.getElementById('editEndKms').value),
            rentalFee: parseFloat(document.getElementById('editRentalFee').value),
            fuelExpense: parseFloat(document.getElementById('editFuelExpense').value),
            tripExpense: parseFloat(document.getElementById('editTripExpense').value),
            driverBata: parseFloat(document.getElementById('editDriverBata').value),
            creditedTo: document.getElementById('editCreditedTo').value,
        };

        // Integer validations
        const intFields = [
            {name: 'Start KMs', value: updated.startKms},
            {name: 'End KMs', value: updated.endKms},
            {name: 'Rental Fee', value: updated.rentalFee},
            {name: 'Fuel Expense', value: updated.fuelExpense},
            {name: 'Trip Expense', value: updated.tripExpense},
            {name: 'Driver Bata', value: updated.driverBata},
        ];
        for (const f of intFields) {
            if (!Number.isInteger(f.value)) {
                alert(`${f.name} must be an integer.`);
                return;
            }
        }

        if (isNaN(updated.startKms) || isNaN(updated.endKms) || updated.endKms < updated.startKms) {
            alert('Please ensure End KMs is greater than or equal to Start KMs.');
            return;
        }

        updated.totalKms = Math.max(0, updated.endKms - updated.startKms);
        updated.totalExpenses = (updated.fuelExpense || 0) + (updated.tripExpense || 0) + (updated.driverBata || 0);
        updated.companyRevenue = (updated.rentalFee || 0) - updated.totalExpenses;
        if (updated.rentalFee < updated.totalExpenses) {
            alert('Rental Fee must be greater than or equal to the sum of Fuel, Trip Expense, and Driver Bata.');
            return;
        }
        updated.profit = updated.companyRevenue;
        updated.mileage = updated.totalKms;

        if (firebaseEnabled) {
            try {
                await updateDoc(doc(db, 'trips', editingTripId), updated);
            } catch (err) {
                console.error('Error updating trip:', err);
                alert('Failed to update trip in Firestore.');
                return;
            }
        } else {
            const all = JSON.parse(localStorage.getItem(TRIPS_KEY) || '[]');
            const idx = all.findIndex(t => String(t.id) === String(editingTripId));
            if (idx >= 0) {
                all[idx] = { ...all[idx], ...updated };
                localStorage.setItem(TRIPS_KEY, JSON.stringify(all));
                // Archive update
                sendToArchive('/api/update_trip', { id: editingTripId, ...all[idx] });
            }
        }

        document.getElementById('editTripSection').style.display = 'none';
        editingTripId = null;
        loadDashboard();
    });
}

function clearAllData() {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone!')) return;
    
    localStorage.removeItem(TRIPS_KEY);
    localStorage.removeItem(MAINTENANCE_KEY);
    initStorage();
    loadDashboard();
    alert('All data has been cleared.');
}

// Export current month report to CSV (Excel-compatible)
async function exportReport() {
    const trips = await getTrips();
    const maintenance = await getMaintenance();
    const selectedMonth = document.getElementById('monthFilter').value;

    let filteredTrips = trips;
    let filteredMaintenance = maintenance;
    if (selectedMonth !== 'all') {
        filteredTrips = trips.filter(trip => {
            const d = new Date(trip.endDate || trip.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
        });
        filteredMaintenance = maintenance.filter(m => {
            const d = new Date(m.date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === selectedMonth;
        });
    }

    const totalRevenue = filteredTrips.reduce((sum, trip) => sum + trip.rentalFee, 0);
    const totalTripExpenses = filteredTrips.reduce((sum, trip) => sum + trip.totalExpenses, 0);
    const totalMaintenanceExpenses = filteredMaintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenses = totalTripExpenses + totalMaintenanceExpenses;
    const netProfit = totalRevenue - totalExpenses;
    const vimalExpenses = filteredMaintenance.filter(m => (m.stakeholder || '').toLowerCase() === 'vimal').reduce((sum, m) => sum + m.cost, 0);
    const sarathExpenses = filteredMaintenance.filter(m => (m.stakeholder || '').toLowerCase() === 'sarath').reduce((sum, m) => sum + m.cost, 0);
    const halfMaintenance = totalMaintenanceExpenses / 2;
    const baseShare = netProfit / 2;
    const vShare = baseShare + (vimalExpenses - halfMaintenance);
    const sShare = baseShare + (sarathExpenses - halfMaintenance);

    function esc(val) {
        if (val == null) return '';
        const s = String(val).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    }

    const lines = [];
    const monthLabel = selectedMonth === 'all' ? 'All Time' : selectedMonth;
    lines.push(`Month,${esc(monthLabel)}`);
    lines.push(`Total Revenue,${totalRevenue.toFixed(2)}`);
    lines.push(`Total Expenses,${totalExpenses.toFixed(2)}`);
    lines.push(`Net Profit,${netProfit.toFixed(2)}`);
    lines.push(`Profit Share Vimal,${vShare.toFixed(2)}`);
    lines.push(`Profit Share Sarath,${sShare.toFixed(2)}`);
    const revenueVimal = filteredTrips.filter(t => (t.creditedTo || '').toLowerCase() === 'vimal').reduce((sum, t) => sum + t.rentalFee, 0);
    const revenueSarath = filteredTrips.filter(t => (t.creditedTo || '').toLowerCase() === 'sarath').reduce((sum, t) => sum + t.rentalFee, 0);
    const cashV = revenueVimal - vimalExpenses;
    const cashS = revenueSarath - sarathExpenses;
    const settleV = baseShare - cashV;
    const settleS = baseShare - cashS;
    lines.push(`Settlement Vimal,${settleV.toFixed(2)}`);
    lines.push(`Settlement Sarath,${settleS.toFixed(2)}`);
    lines.push(`Total Trips,${filteredTrips.length}`);
    lines.push('');

    lines.push('Trips');
    lines.push('Date,Driver,Trip,KMs,Rental Fee,Credited To,Expenses,Profit,Notes');
    filteredTrips.forEach(t => {
        lines.push([
            new Date(t.endDate || t.date).toLocaleDateString(),
            esc(t.driverName),
            esc(t.tripName),
            (t.totalKms ?? 0),
            t.rentalFee.toFixed(2),
            esc(t.creditedTo || ''),
            t.totalExpenses.toFixed(2),
            t.profit.toFixed(2),
            esc(t.notes || '')
        ].join(','));
    });
    lines.push('');

    lines.push('Maintenance');
    lines.push('Date,Payed by,Description,Cost');
    filteredMaintenance.forEach(m => {
        lines.push([
            new Date(m.date).toLocaleDateString(),
            esc(m.stakeholder || ''),
            esc(m.description || ''),
            m.cost.toFixed(2)
        ].join(','));
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const fname = selectedMonth === 'all' ? 'report_all_time.csv' : `report_${selectedMonth}.csv`;
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Edit Maintenance
let editingMaintenanceId = null;
async function editMaintenance(id) {
    const section = document.getElementById('editMaintenanceSection');
    const form = document.getElementById('editMaintenanceForm');
    if (!section || !form) return;
    const maintenance = await getMaintenance();
    const record = maintenance.find(m => String(m.id) === String(id));
    if (!record) return alert('Maintenance record not found.');
    editingMaintenanceId = id;
    document.getElementById('editMaintenanceDate').value = (record.date ? new Date(record.date).toISOString().slice(0,10) : '');
    document.getElementById('editMaintenanceStakeholder').value = record.stakeholder || 'Vimal';
    document.getElementById('editMaintenanceDesc').value = record.description || '';
    document.getElementById('editMaintenanceCost').value = record.cost ?? '';
    section.style.display = 'block';
}

// Wire maintenance edit form
if (document.getElementById('editMaintenanceForm')) {
    const cancelBtn = document.getElementById('editMaintenanceCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('editMaintenanceSection').style.display = 'none';
            editingMaintenanceId = null;
        });
    }

    document.getElementById('editMaintenanceForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!editingMaintenanceId) return;
        const dateVal = document.getElementById('editMaintenanceDate').value;
        const stakeholderVal = document.getElementById('editMaintenanceStakeholder').value;
        const descVal = document.getElementById('editMaintenanceDesc').value;
        const costVal = parseFloat(document.getElementById('editMaintenanceCost').value);
        if (!dateVal) return alert('Please select a date.');
        if (!stakeholderVal) return alert('Please select a stakeholder.');
        if (!Number.isInteger(costVal)) return alert('Cost must be an integer.');
        const updated = {
            date: new Date(dateVal).toISOString(),
            stakeholder: stakeholderVal,
            description: descVal,
            cost: costVal,
        };
        if (firebaseEnabled) {
            try {
                await updateDoc(doc(db, 'maintenance', editingMaintenanceId), updated);
            } catch (err) {
                console.error('Error updating maintenance:', err);
                alert('Failed to update maintenance in Firestore.');
                return;
            }
        } else {
            const all = JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || '[]');
            const idx = all.findIndex(m => String(m.id) === String(editingMaintenanceId));
            if (idx >= 0) {
                all[idx] = { ...all[idx], ...updated };
                localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(all));
                // Archive update
                sendToArchive('/api/update_maintenance', { id: editingMaintenanceId, ...all[idx] });
            }
        }
        document.getElementById('editMaintenanceSection').style.display = 'none';
        editingMaintenanceId = null;
        loadDashboard();
    });
}
