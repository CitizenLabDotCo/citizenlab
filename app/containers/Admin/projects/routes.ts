import loadAndRender from 'utils/loadAndRender';

export default () => ({
  path: 'projects',
  name: 'admin projects',
  getComponent: loadAndRender(import('containers/Admin/projects')),
  indexRoute: {
    name: 'admin projects index',
    getComponent: loadAndRender(import('containers/Admin/projects/all')),
  },
  childRoutes: [
    {
      path: ':projectId/edit',
      name: 'admin projects single project',
      getComponent: loadAndRender(import('containers/Admin/projects/edit')),
      indexRoute: {
        name: 'admin projects single edit',
        getComponent: loadAndRender(import('containers/Admin/projects/edit/general')),
      },
      childRoutes: [
        {
          path: 'description',
          name: 'admin projects description',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/description')),
        },
        {
          path: 'ideas',
          name: 'admin projects ideas manager',
          getComponent: loadAndRender(import('components/admin/IdeaManager')),
        },
        {
          path: 'timeline',
          name: 'admin projects timeline',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/timeline')),
        },
        {
          path: 'timeline/new',
          name: 'admin projects timeline create',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/timeline/edit')),
        },
        {
          path: 'timeline/:id',
          name: 'admin projects timeline edit',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/timeline/edit')),
        },
        {
          path: 'events',
          name: 'admin projects events',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events')),
        },
        {
          path: 'events/new',
          name: 'admin projects events create',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events/edit')),
        },
        {
          path: 'events/:id',
          name: 'admin projects events edit',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events/edit')),
        },
        {
          path: '/admin/projects/new',
          name: 'admin projects create new',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/general')),
        },
        {
          path: 'events',
          name: 'admin projects edit events',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/events')),
        },
        {
          path: 'permissions',
          name: 'admin projects edit permissions',
          getComponent: loadAndRender(import('containers/Admin/projects/edit/permissions')),
        },
      ],
    },
  ],
});
