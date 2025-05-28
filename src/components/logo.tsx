import { ActivitySquare } from 'lucide-react';
import React from 'react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 p-2 text-xl font-semibold text-sidebar-primary group-data-[collapsible=icon]:justify-center">
      <ActivitySquare className="h-7 w-7 text-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
      <span className="group-data-[collapsible=icon]:hidden">PatientWise</span>
    </div>
  );
}
