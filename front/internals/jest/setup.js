import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';
import '@testing-library/jest-dom';

configure({ adapter: new Adapter() });

jest.mock('polished');
jest.mock('modules');
jest.mock('quill-blot-formatter');
jest.mock('history', () => ({
  createBrowserHistory: () => ({
    replace: jest.fn(),
    length: 0,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: '',
    },
    action: 'REPLACE',
    push: jest.fn(),
    go: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    block: jest.fn(),
    listen: jest.fn(),
    createHref: jest.fn(),
    parsePath: jest.fn(),
  }),
}));
