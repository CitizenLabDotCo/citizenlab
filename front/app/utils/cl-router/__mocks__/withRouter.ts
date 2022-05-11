import { WithRouterProps } from 'utils/withRouter';

export const mockWithRouterProps: WithRouterProps = {
  location: {
    pathname: 'some-page',
    search: '',
    query: {},
    state: '',
    hash: '',
    key: '',
  },
  params: {},
  navigate: jest.fn(),
};
