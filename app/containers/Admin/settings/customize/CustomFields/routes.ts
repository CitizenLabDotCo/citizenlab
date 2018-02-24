import Wrapper from './';
import All from './all';
import Edit from './edit';

export default () => ({
  path: '/admin/custom_fields',
  name: 'admin groups',
  component: Wrapper,
  indexRoute: {
    name: 'admin groups index',
    component: All,
  },
  childRoutes: [
    {
      path: '/admin/custom_fields/edit/:customFieldId',
      name: 'admin groups single group',
      component: Edit,
    },
  ],
});
