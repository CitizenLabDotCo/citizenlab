import { createContext } from 'react';

/**
 * True when the global admin rail is force-collapsed (icon-only) regardless of
 * viewport width — e.g. in the redesigned project back office, where the rail
 * is always collapsed (no expand toggle) to leave room for the project
 * sidebar.
 *
 * Sidebar subcomponents OR this with their own `useBreakpoint('tablet')` check
 * so the responsive (tablet) collapse keeps working as before.
 */
const SidebarCollapsedContext = createContext(false);

export default SidebarCollapsedContext;
