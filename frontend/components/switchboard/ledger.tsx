import { WorkflowNotice } from "./workflow-notice";

export function LedgerView() {
  return (
    <WorkflowNotice
      title="Business activity history is not connected yet"
      description="The activity ledger will be available when deal approvals and transaction workflows are implemented. The current shop tools do not process orders or payments."
      actions={[
        { href: "/dashboard/store", label: "Manage shop" },
        { href: "/dashboard/assistant", label: "Open assistant" },
      ]}
    />
  );
}
