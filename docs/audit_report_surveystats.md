# Audit & Implementation Plan: SurveyStatsView Accuracy

## 1. Audit Report

### Current State
- **Static/Default Count**: The view is reporting a total of `150,849` data points. This appears to be the total count of the `survey_units_with_stats` view without effective filtering.
- **Filtering Failure**: Selecting a District or Tehsil does not update the survey numbers accurately. Specifically, selecting **Khushab, Sargodha, or Bhalwal** and toggling the **Active** status (Biller/New) often returns empty results or zero counts even when massive datasets exist for these areas.
- **Root Causes**:
    1. **Normalization Mismatch**: The frontend (via `useLocationHierarchy`) `TRIM`s and `UPPERCASE`s all location strings (e.g., sending "SARGODHA"). The backend RPC (`get_hydrated_survey_stats`) uses exact string matching (`s.city_district = p_district`). If the database contains "Sargodha" or "sargodha", the filter returns 0 records.
    2. **Status Logic Rigidity**: The `p_master_status` logic in the RPC expects very specific string matches ('ACTIVE_BILLER', 'NEW_SURVEY'). Combined with the string mismatch, this causes the "Active" filter to collapse to zero across all districts.
    3. **View Logic Complexity**: The `survey_units_with_stats` view might be performing an inner join that excludes certain records or a left join that duplicates others.

---

## 2. Implementation Plan

### Phase 1: Database Logic Hardening
#### [SQL] Update `get_hydrated_survey_stats`
- **Normalization**: Inject `TRIM(UPPER(...))` into the `WHERE` clause for `p_district`, `p_tehsil`, and `p_uc`.
- **Null Safety**: Ensure `total_result_count` handles the `p_master_status` logic correctly for all edge cases.
- **View Audit**: Inspect the `survey_units_with_stats` definition to ensure it is 1-to-1 with `survey_units`.

### Phase 2: Frontend Defensive Mapping
#### [MODIFY] [SurveyStatsView.jsx](file:///f:/qoder/billing-system/03_Frontend_App/src/views/SurveyStatsView.jsx)
- Update the `fetchData` call to ensure parameters are explicitly sanitized before being sent to Supabase.
- Modify the `Reset` logic to be truly global (empty strings) rather than hardcoding a specific city.
- Add a "Loading" state for the `totalCount` to prevent showing the previous number while the filter is processing.

### Phase 3: Verification
- Compare `totalCount` in `SurveyStatsView` against a direct `SELECT COUNT(*) FROM survey_units` with the same filters.
- **Khushab Validation**: Confirm that selecting "KHUSHAB" + "Active" status correctly displays the records that were previously hidden by the normalization mismatch.
- Verify that selecting "BHALWAL" correctly reduces the count from the global `150k` to the specific tehsil total.

---

## 3. Next Steps
1. **Script Verification**: I will re-run the `Phase1_RPC_Setup.sql` with normalized comparison logic.
2. **Data Integrity Check**: Verify if `150,849` is indeed the correct global number or if it includes duplicates that should be filtered out.
