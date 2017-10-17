import GroupContainer from './';
import GroupList from './all';
import GroupEdit from './edit';

async function loadComponent(componentPath: string, cb) {
  const component = await import(componentPath).catch(console.error);
  cb(null, component);
}

export default () => ({
  path: '/admin/groups',
  name: 'admin groups',
  component: GroupContainer,
  indexRoute: {
    name: 'admin groups index',
    component: GroupList,
  },
  childRoutes: [
    {
      path: '/admin/groups/edit/:groupId',
      name: 'admin groups single group',
      component: GroupEdit,
    },
  ],
});
