import { WithRouterProps } from 'react-router';

export const mockWithRouterProps : WithRouterProps = {
  location: {
    pathname: 'some-page',
    search: '',
    query: '',
    state: '',
    action: 'PUSH',
    key: '',
    hash: ''
  },
  router: {
    push: () => null,
    replace: () => null,
    go: () => null,
    goBack: () => null,
    goForward: () => null,
    setRouteLeaveHook: () => null,
    createPath: () => '',
    createHref: () => '',
    isActive: () => true,
  },
  params: {},
  routes: []
};
