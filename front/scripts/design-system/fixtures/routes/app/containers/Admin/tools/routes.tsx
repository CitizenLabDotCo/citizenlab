import { parseModuleRoutes } from 'utils/moduleUtils';
import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';

// Paths may come from an enum, as in UsersShowPage/routes.tsx.
export enum toolsPaths {
  tools = 'tools',
}

const toolsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: toolsPaths.tools,
});

const createAdminToolsRoutes = (moduleRoutes: any[] = []) =>
  toolsRoute.addChildren([...parseModuleRoutes(moduleRoutes, toolsRoute)]);

export default createAdminToolsRoutes;
