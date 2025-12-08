"use client";

import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import LeadsTable from "@/components/tables/LeadsTable";

export default function AllLeadsClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLeadAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="">
      <PageBreadcrumb pageTitle="Manage All Leads" onLeadAdded={handleLeadAdded} />

      <div className="space-y-6">
        <ComponentCard title="Manage All Leads">
          <LeadsTable refreshTrigger={refreshTrigger} />
        </ComponentCard>
      </div>
    </div>
  );
}
