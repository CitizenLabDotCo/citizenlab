import '@testing-library/jest-dom';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

global.ResizeObserver = require('resize-observer-polyfill');

jest.mock('polished');
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
