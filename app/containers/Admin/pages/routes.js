import Wrapper from './';
import All from './All';
import Edit from './Edit';
import New from './New';
import BodyEditor from './BodyEditor';

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
      path: ':pageId/editor/:locale',
      component: BodyEditor,
    },
    {
      path: ':pageId',
      component: Edit,
    },
  ],
});
