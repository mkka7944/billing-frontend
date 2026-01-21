# Strategic Roadmap: Advanced Financial Reporting & KPI Engine

## 1. Vision: The Analytical Command Center
The goal is to transition from "Simple Billing" to "Intelligent Revenue Management." This section will serve as the source of truth for all monthly executive reports, using consistent KPIs that scale automatically as we add future months (Feb-2026, March-2026, etc.).

---

## 2. Core KPIs (Key Performance Indicators)

### A. The "Consistency Score" (Payer Loyalty)
*   **Definition**: The percentage of consumers who have paid 100% of their bills over the last 3, 6, and 12 months.
*   **Value**: Identifies the "Reliable Core" vs. "High Risk" consumers.

### B. Collection Efficiency (CE)
*   **Definition**: `(Amount Collected / Total Current Demand) * 100`.
*   **Value**: The primary health metric for recovery teams in each Tehsil.

### C. Arrears Clawback Ratio
*   **Definition**: Percentage of historical debt (Arrears) recovered in the current billing cycle.
*   **Value**: Measures how effectively the team is cleaning up old pending balances.

### D. New Survey Conversion Rate
*   **Definition**: Rate at which a "New Survey" (Status: Pending) receives its first PSID and generates its first payment.
*   **Value**: Measures the speed of the pipeline from Field Survey -> Revenue.

---

## 3. Technical Architecture for Scaling

### Stage 1: Dynamic Cohort RPC (Current Path)
We will expand the `get_payer_retention_report` to be **Dynamic**.
- **Change**: Instead of hardcoding 'Oct-2025', the RPC will accept `p_start_month` and `p_end_month`.
- **Automatic Extension**: As your "Paid History" Excel files are uploaded, the RPC will automatically incorporate the new months into the retention percentages without any code changes.

### Stage 2: Materialized Analytics (Performance)
As the database reaches 500,000+ records, calculating these sums in real-time may become slow. 
- **Solution**: We will implement a `monthly_summary_ledger` table that pre-calculates the totals once per night. This makes reporting "Instant" regardless of data size.

---

## 4. UI Implementation: The "Report Studio"

### Section 1: Retention Funnels
A dedicated view showing cross-tehsil loyalty.
- **Visual**: A comparison table where Bhalwal, Sargodha, and Khushab are ranked by their ability to keep payers consistent over 4 months.

### Section 2: Sequential Monthly Trends
A line chart showing:
- **Blue Line**: Total Demand (Growth of system)
- **Green Line**: Actual Collection (Revenue)
- **Gap Area**: "The Opportunity Gap" (Unrecovered funds)

---

## 5. Implementation Sequence

### Q1 Tasks (Immediate)
1.  **Harden Month-over-Month logic**: Ensure that if a user skips Nov but pays Dec, they are flagged as "Non-Consistent" but still count towards "Recovery."
2.  **Excel Pipeline Stability**: Ensure that `migrate_life_cycle.py` handles Jan-2026 and Feb-2026 without manual schema changes.

### Q2 Tasks (Future)
1.  **Executive PDF Export**: Build a "Print Report" button that generates a high-fidelity summary for management.
2.  **Predictive Accuracy**: Use historical data to predict next month's recovery volume.

---

## 6. Verification & Accuracy
- **Zero-Drop Rule**: A reported total must always equal the sum of its district-level components. 
- **Audit Logs**: Every report will show the "Last Data Sync" timestamp to ensure managers are looking at the latest portal data.
