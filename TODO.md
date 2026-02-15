# TODO / Roadmap

## Current scope
- **Owners:** Sarath and Vimal.
- **Testing now:** Single vehicle — **Traveller** only.
- **Later:** Vimal has multiple vehicles; will include other vehicles after Traveller success.

---

## TODO: Vehicle support

### 1. Driver form
- [ ] Add a **Vehicle** field (dropdown or select).
- [ ] Options: **Traveller** (for now); later add other vehicles.
- [ ] Driver chooses the vehicle for the trip before submitting.
- [ ] Save `vehicle` (or `vehicleId`/`vehicleName`) with each trip in app + Google Sheet + data folder.

### 2. Maintenance (optional)
- [ ] Decide: is maintenance per vehicle or global? If per vehicle, add **Vehicle** to maintenance form and store with each record.
- [ ] If per vehicle: filter maintenance by selected vehicle on dashboard.

### 3. Dashboard
- [ ] Add **Vehicle** selector (dropdown) at top — e.g. "Traveller", later "Vehicle 2", etc.
- [ ] When a vehicle is selected:
  - Show only **trips** for that vehicle.
  - Show only **maintenance** for that vehicle (if maintenance is per vehicle).
  - Show **same stats** (Total Revenue, Total Expenses, Net Profit, Trip count, Profit Share Vimal/Sarath, Settlement) **for that vehicle only**.
- [ ] Default: e.g. "Traveller" or "All vehicles" (if "All" is needed later).

### 4. Data layer
- [ ] Ensure `vehicle` is stored in: trip object (app.js), Google Sheet (Trips sheet column + Apps Script), server.py/data/trips.json if used.
- [ ] If maintenance is per vehicle: same for maintenance.

### 5. Later (after Traveller success)
- [ ] Add more vehicles to the vehicle list (form + dashboard).
- [ ] Optionally: "All vehicles" view on dashboard (aggregate).

---

## Notes
- Testing with **Traveller only** first; no need to implement "All vehicles" until other vehicles are added.
- When you're ready to implement, we’ll do: form field → save vehicle → dashboard filter + vehicle-scoped stats.
