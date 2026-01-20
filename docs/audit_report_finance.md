# Finance View & Data Pipeline Audit Report

## 1. FinanceView Audit

### Issue 1: Transaction Health Detail Error
- **Symptoms**: The "Transaction Health Detail" section (Right Sidebar) is throwing errors.
- **Root Cause**: The `get_unit_history_360` RPC might be returning a structure that `FinanceView.jsx` doesn't gracefully handle when data is missing or if the RPC signature mismatches the deployed version. Specifically, if `recordHistory` is null/undefined during the fetch state, the UI might be trying to access properties on it.
- **Fix**: 
    1. Implement robust null checks (`?.`) for all nested properties in the Right Sidebar.
    2. Verify the `get_unit_history_360` RPC is deployed and returning the expected `unit`, `bills`, `stats` columns.
    3. Ensure `p_survey_id` is passed as a string.

### Issue 2: Filter Discrepancy & Reusability
- ** Observation**: `FinanceView` uses a basic `Select` strip, while `SurveyStatsView` has a robust, hierarchical filter matrix with mobile support.
- **Recommendation**: **YES**, the filter section from `SurveyStatsView` should be extracted into a reusable `FilterBar` component. This component should handle:
    - `useLocationHierarchy` logic.
    - Desktop (Grid) vs Mobile (Sheet) layouts.
    - State lifting (passing filters back to the parent view).
- **Benefit**: Consistent UX across "Survey Stats" and "Finance" views and reduced code duplication.

### Issue 3: Irrelevant City Data (Left Sidebar)
- **Observation**: The user flagged "cities we dont have services in" appearing in the summaries.
- **Root Cause**: The Left Sidebar ("Tehsil Wise Paid", etc.) is currently powered by **STATIC MOCK DATA** (lines 72-92 in `FinanceView.jsx`). It is NOT fetching real data from the database yet.
- **Fix**: Replace the mock data with a real RPC (`get_financial_summaries`) that aggregates bills by location based on actual `active_biller` records.

---

## 2. Comprehensive Data Pipeline Audit (Finalized)

Based on the latest versions (`bill-extractor-v4.py`, `survey_filtered.py`) and `docs/DATA_INTEGRITY_REPORT.md`, the system operates as follows:

### 2.1 The Pipeline Architecture

**Phase 1: Ingestion (The Sources)**
1.  **Bill Extraction (`bill-extractor-v4.py`)**:
    - **Role**: Universal fetcher for payment & billing history.
    - **Capabilities**: Supports "Strict Sync", Parallel Fetching, and Auto-Sorting.
    - **Output**: `COMBINED_ALL_CITIES_..._Full.csv` (Master Payment Ledger).
    - **Key Data**: `PSID`, `Paid Amount`, `Paid Date`, `Channel`.

2.  **Survey Extraction (`survey_filtered.py`)**:
    - **Role**: Fetches Survey Unit profiles (Consumer Name, Location, Images).
    - **Modes**:
        - **Bulk**: Downloads all historical pages.
        - **Strict Sync (Daily)**: Checks Local Max ID vs Portal Max ID and fetches *only* the new records.
    - **Integration**: Generates `ALL_DISTRICTS_TEHSILS_MASTER.csv`.

3.  **Biller Lists (`inputs/excel_dumps/*BILLER*.csv`)**:
    - **Role**: **The SOURCE OF TRUTH for Revenue & Tariff.**
    - **Content**: These are the official files from the billing authority.
    - **Key Data**: 
        - `Monthly Fee`: The fixed recurring base rate (e.g., 500).
        - `Billing Category`: The tariff slab (e.g., '5-10 Marla').
        - `Total Payable`: The final bill amount including **Arrears & Fines** (Already used for Bill History).

**Phase 2: Injection (The Bridge)**
*   **`scripts/migrate_to_supabase.py`**: **THE CENTRAL BUS**.
    - **Input**: It consumes **All 3 Sources** explained above.
    - **Logic**:
        - **Daily Sync**: Run `survey_filtered.py` -> Run `migrate_to_supabase.py`.
        - **Bulk Load**: Same script, scans all folders.
    - **Status**: It currently reads Biller Lists to match PSIDs but **ignores** the `Monthly Fee` and `Billing Category` columns.

**Phase 3: Storage (Supabase)**
- **`survey_units`**: Master Profile (PK: `survey_id`).
- **`bills`**: Transaction Ledger (PK: `psid` + `bill_month`).

---

## 3. Recommended RPC Strategy (Phase 2 Reporting)

To fulfill the request for "City wise", "MC/UC wise", and "Recovery Team" reports, we need a standard Reporting RPC suite.

#### A. `get_finance_summary_metrics`
**Purpose**: Populates the Left Sidebar with real aggregated data.
- **Inputs**: `p_district`, `p_tehsil` (Optional filters).
- **Outputs**: 
    - `tehsil_stats`: Array of `{ name, total_bills, total_amount, recovery_percentage }`
    - `uc_stats`: Array of `{ name, total_bills, total_amount }`
    - `category_stats`: Array of `{ name (Domestic/Commercial), total_amount }`

#### B. `get_unit_payment_profile`
**Purpose**: Detailed audit for a single Survey ID (already partially covered by `get_unit_history_360`, but needs "Current Status" clarification).
- **Logic**: 
    - Count `total_months_paid`.
    - Check `is_active_biller`.
    - Determine `recovery_status` (Good/Defaulter/Inactive).

#### C. `get_recovery_performance_report`
**Purpose**: For Recovery Teams (MC/UC wise).
- **Logic**: List all UCs with their "Defaulter Count", "Recovery Rate %", and "Total Outstanding".

### Issue 4: Critical Data Gap (Monthly Fee & Billing Category)
- **Observation**: The database is missing `monthly_fee` (Assigned Bill Amount) and `billing_category` (Tariff Slab).
- **Impact**: Unable to calculate expected revenue or segment users by tariff class.
- **Root Cause**: `migrate_to_supabase.py` parses `Biller List` files but only extracts the `PSID`. It **discards** the `Monthly Fee` and `Billing Category` columns.

## 4. Execution Plan: Recovery & Operations

### A. Fixing the Missing Data (The "Patch")
1.  **Schema Update**: Run SQL to add `monthly_fee` and `billing_category` to `survey_units`.
2.  **Script Update**: Modify `migrate_to_supabase.py` (specifically the `process_csvs` -> Biller Loading section):
    - When reading `Biller_*.csv`:
    - Map `Monthly Fee` -> `monthly_fee`.
    - Map `Billing Category` -> `billing_category`.
    - Store this in a lookup dictionary keyed by `Survey ID`.
    - When processing `Survey CSVs` later, look up these values and inject them into the upsert payload.
3.  **Re-Run**: Execute `migrate_to_supabase.py`.

### B. Standard Operating Procedure (Daily)
1.  **Step 1 (Survey Sync)**: Run `survey_filtered.py --option 3`.
2.  **Step 2 (Bill Sync)**: Run `bill-extractor-v4.py`.
3.  **Step 3 (Push)**: Run `migrate_to_supabase.py`.
    - It will automatically detect if new Biller Lists have been dropped into `inputs/excel_dumps` and update the amounts/categories accordingly.

---

## 5. Finalized Data Pipeline Workflow (Step-by-Step Guide)

### Operational Overview
The system follows a simple "Fetch and Push" workflow.

#### Step 1: Update Survey Data
**Goal**: Get new consumer registrations from the portal.
- **Script**: `python scripts/survey_filtered.py`
- **Option Mode**: `3` (Strict Sync)
- **Action**: Checks the last Survey ID in your local files against the Portal. Downloads **only new records**.
- **Output**: Updates `ALL_DISTRICTS_TEHSILS_MASTER.csv` in `outputs/scraped_data`.

#### Step 2: Update Financial Data
**Goal**: Get the latest payment confirmations.
- **Script**: `python scripts/bill-extractor-v4.py`
- **Action**: Fetches all paid bills, sorts them, and merges them.
- **Output**: `COMBINED_ALL_CITIES_PAID_ALL_HISTORY_Full.csv` in `outputs/scraped_data`.

#### Step 3: Configure Revenue (Monthly)
**Goal**: Define the "Expected Revenue" and "Tariffs".
- **Action**: Manually copy the official Biller List CSVs (e.g., `Biller_Sargodha_Nov2025.csv`) into the folder `inputs/excel_dumps`.
- **Role**: These files act as the configuration for `monthly_fee` and `billing_category`.

#### Step 4: The Push (Injection)
**Goal**: Sync everything to the Cloud (Supabase).
- **Script**: `python scripts/migrate_to_supabase.py`
- **Action**: 
    1. Reads **Survey CSVs** (Step 1) to verify Unit IDs.
    2. Reads **Payment CSVs** (Step 2) to update "Paid Status".
    3. Reads **Biller Lists** (Step 3) to set "Monthly Fee" and "Category".
    4. **Upserts** (Updates/Inserts) all data to the live database.

### Summary Table

| Step | Component | Script Name | Input Source | Output File | Destination |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Survey Sync** | `survey_filtered.py` | Suthra Portal (API) | `ALL_DISTRICTS_TEHSILS_MASTER.csv` | Local Folder |
| **2** | **Finance Sync** | `bill-extractor-v4.py` | Suthra Portal (Legacy billing) | `COMBINED_ALL_CITIES_...Full.csv` | Local Folder |
| **3** | **Revenue Config** | *Manual Copy* | Official Biller Excel | `inputs/excel_dumps/Biller_*.csv` | Local Folder |
| **4** | **Cloud Push** | `migrate_to_supabase.py` | All Local CSVs (Above) | **Database State** | **Supabase (Cloud)** |
