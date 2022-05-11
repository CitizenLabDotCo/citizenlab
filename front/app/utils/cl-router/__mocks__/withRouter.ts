import { WithRouterProps } from 'utils/withRouter';

export const mockWithRouterProps: WithRouterProps = {
  location: {
    pathname: 'some-page',
    search: '',
    query: {},
    state: '',
    hash: '',
    action: 'PUSH',
    key: '',
  },
  router: {
    push: () => null,
    replace: () => null,
    go: () => null,
    goBack: () => null,
    goForward: () => null,
    setRouteLeaveHook: () => null as any,
    createPath: () => '',
    createHref: () => '',
    isActive: () => true,
  },
  params: {},
  routes: [],
};
