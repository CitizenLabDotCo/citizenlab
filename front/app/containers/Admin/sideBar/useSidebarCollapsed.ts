import { useContext } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';

import SidebarCollapsedContext from './SidebarCollapsedContext';

export default function useSidebarCollapsed(): boolean {
  const forceCollapsed = useContext(SidebarCollapsedContext);
  const isTablet = useBreakpoint('tablet');

  return forceCollapsed || isTablet;
}
