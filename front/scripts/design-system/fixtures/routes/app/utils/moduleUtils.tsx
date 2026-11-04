export const parseModuleRoutes = (routes: any[], parentRoute: any) =>
  routes.map((r) => ({ ...r, parentRoute }));
