import { createContext } from 'react';

/**
 * True when the global admin rail is force-collapsed (icon-only) regardless of
 * viewport. Sidebar subcomponents OR this with their own
 * `useBreakpoint('tablet')` check so the responsive (tablet) collapse still
 * works.
 */
const SidebarCollapsedContext = createContext(false);

export default SidebarCollapsedContext;
