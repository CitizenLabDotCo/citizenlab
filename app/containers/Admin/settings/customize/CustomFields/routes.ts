import Wrapper from './';
import All from './All';
import Edit from './Edit';
import General from './Edit/General';
import Options from './Edit/Options';
import New from './New';

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
      path: '/admin/custom_fields/new',
      component: New,
    },
    {
      path: '/admin/custom_fields/:customFieldId/general',
      component: Edit,
      indexRoute: {
        component: General,
      },
      childRoutes: [
        {
          path: '/admin/custom_fields/:customFieldId/options',
          component: Options,
        }
      ],
    },
  ],
});
