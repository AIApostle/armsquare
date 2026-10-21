import { WorkflowNotice } from "./workflow-notice";

export function PolicyPanel() {
  return (
    <WorkflowNotice
      title="Transaction rules are not active yet"
      description="Buying, selling, and payment workflows are not enabled, so transaction limits and discount rules cannot be applied. You can manage the assistant's catalog tools and pause it from your shop settings."
      actions={[{ href: "/dashboard/store", label: "Manage assistant settings" }]}
    />
  );
}
