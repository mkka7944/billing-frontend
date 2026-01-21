# Finance Redesign Strategy: Stability & Precision

## Goal
To eliminate intermittent errors in financial summaries and ensure 100% data integrity across all filter permutations.

## Way Forward

### 1. Hardened Aggregation (SQL/RPC Layer)
The primary suspect for "sometimes" errors is the handling of empty sets or partial data in the Supabase RPCs.
*   **Null Coalescing**: Every SQL summation and calculation will be wrapped in `COALESCE(..., 0)` to guarantee that the backend returns a number (`0`) instead of `null` when no records match a filter.
*   **Type Casting**: Explicitly casting results to fixed numeric types (e.g. `DECIMAL` or `BIGINT`) prevents the frontend from receiving scientific notation or unexpected string formats for very large sums.

### 2. Defensive UI Mapping (Frontend Layer)
Even with clean data, the React layer needs "safety nets" to prevent the entire view from crashing if one metric is malformed.
*   **Optional Chaining & Fallbacks**: Using optional chaining extensively across the total section and providing immediate fallbacks (e.g., `data?.total_paid ?? 0`) before any formatting logic runs.
*   **Formatting Guardrails**: Ensuring that formatting functions (like `.toLocaleString()`) are only called after verifying the input is a valid finite number.
*   **Error Boundaries**: Wrapping the "Total Section" in a local React Error Boundary so that a failure in one complex summary card doesn't break the entire Finance dashboard navigation.

### 3. Data-State Synchronization Audit
Sometimes the error occurs because the UI expects a specific JSON structure (e.g., a nested object for "monthly breakdown") that might be missing from the response when a specific filter (like an empty MC category) is applied.
*   **Zero-State Mocking**: Aligning the "Loading/Empty" state structure exactly with the "Populated" state structure so the UI logic never encounters an `undefined` property access.

---
**Status**: Discussion Stage
**Last Updated**: 2026-01-21
**Next Action**: Audit `rpc_finance_metrics` return schema vs `FinanceView.jsx` mapping.
