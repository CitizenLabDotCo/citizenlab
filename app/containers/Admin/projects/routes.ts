import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: '/admin/projects',
  name: 'admin projects',
  getComponent: loadAndRender(import('containers/Admin/projects')),
  indexRoute: {
    name: 'admin projects index',
    getComponent: loadAndRender(import('containers/Admin/projects/all')),
  },
  childRoutes: [
    {
      path: '/admin/projects/:projectId/edit',
      name: 'admin projects single project',
      getComponent: loadAndRender(import('containers/Admin/projects/edit')),
      indexRoute: {
        name: 'admin projects single edit',
        getComponent: loadAndRender(import('containers/Admin/projects/edit/general')),
      },
      childRoutes: [
        {
          path: '/admin/projects/:projectId/description',
          name: 'admin projects description',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/description')),
        },
        {
          path: '/admin/projects/:projectId/ideas',
          name: 'admin projects ideas manager',
          getComponent: loadAndRender(import('components/admin/IdeaManager')),
        },
        {
          path: '/admin/projects/:projectId/timeline',
          name: 'admin projects timeline',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/timeline')),
        },
        {
          path: '/admin/projects/:projectId/timeline/new',
          name: 'admin projects timeline create',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/timeline/edit')),
        },
        {
          path: '/admin/projects/:projectId/timeline/:id',
          name: 'admin projects timeline edit',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/timeline/edit')),
        },
        {
          path: '/admin/projects/:projectId/events',
          name: 'admin projects events',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events')),
        },
        {
          path: '/admin/projects/:projectId/events/new',
          name: 'admin projects events create',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events/edit')),
        },
        {
          path: '/admin/projects/:projectId/events/:id',
          name: 'admin projects events edit',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events/edit')),
        },
        {
          path: '/admin/projects/new',
          name: 'admin projects create new',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/general')),
        },
        {
          path: '/admin/projects/:projectId/events',
          name: 'admin projects edit events',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events')),
        },
        {
          path: '/admin/projects/:projectId/permissions',
          name: 'admin projects edit permissions',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/permissions')),
        },
      ],
    },
  ],
});
