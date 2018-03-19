import Wrapper from './';
import All from './All';
import Edit from './Edit';
import New from './New';

export default () => ({
  path: 'pages',
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
      path: ':pageId',
      component: Edit,
    },
  ],
});
