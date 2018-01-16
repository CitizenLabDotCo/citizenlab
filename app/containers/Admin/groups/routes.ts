import GroupContainer from './';
import GroupList from './all';
import GroupEdit from './edit';

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
