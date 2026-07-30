// Author: Parth Pancholi

import React from 'react';
import { SidebarEdgeToggle } from './SidebarEdgeToggle';

interface CollapsibleSidebarShellProps {
  open: boolean;
  onToggle: () => void;
  toggleIcon: React.ReactNode;
  toggleTitle?: string;
  railChildren?: React.ReactNode;
  drawerChildren: React.ReactNode;
  drawerWidthClass?: string;
}

/**
 * Backdrop + always-visible icon rail + conditional drawer, shared by the
 * editor's files sidebar and the chat's sessions sidebar. The drawer is a
 * fixed mobile overlay (dismissed via the backdrop) that docks inline on
 * desktop (md:static).
 */
export const CollapsibleSidebarShell: React.FC<CollapsibleSidebarShellProps> = ({
  open,
  onToggle,
  toggleIcon,
  toggleTitle,
  railChildren,
  drawerChildren,
  drawerWidthClass = 'w-64',
}) => (
  <>
    {open && (
      <div
        onClick={onToggle}
        className="fixed inset-0 top-14 bg-black/40 z-30 md:hidden"
      />
    )}

    <div className="relative flex h-full bg-[#F3F1ED] border-r border-[#E5E2DD] shrink-0">
      <SidebarEdgeToggle side="right" onClick={onToggle} icon={toggleIcon} title={toggleTitle} />

      <div className="w-12 flex flex-col items-center py-3 space-y-3 border-r border-[#E5E2DD] bg-[#EEEBE6] shrink-0">
        {railChildren}
      </div>

      {open && (
        <div
          className={`fixed md:static inset-y-0 top-14 md:top-auto left-12 md:left-auto z-40 md:z-auto ${drawerWidthClass} h-[calc(100vh-3.5rem)] md:h-full flex flex-col overflow-y-auto bg-[#F3F1ED]`}
        >
          {drawerChildren}
        </div>
      )}
    </div>
  </>
);
