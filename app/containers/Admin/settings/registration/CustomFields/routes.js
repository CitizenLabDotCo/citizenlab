import Wrapper from './';
import All from './All';
import Edit from './Edit';
import General from './Edit/General';
import Options from './Edit/Options';
import New from './New';

export default () => ({
  component: Wrapper,
  indexRoute: {
    component: All,
  },
  childRoutes: [
    {
      path: 'new',
      component: New,
    },
    {
      path: ':customFieldId',
      component: Edit,
      childRoutes: [
        {
          path: 'general',
          component: General,
        },
        {
          path: 'options',
          component: Options,
        },
      ],
    },
  ],
});
