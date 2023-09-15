import '@testing-library/jest-dom';

import 'whatwg-fetch';

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

jest.mock('utils/cl-router/Link');
jest.mock('utils/cl-router/history');
jest.mock('hooks/useLocale');
jest.mock('hooks/useLocalize');
jest.mock('utils/cl-intl');
jest.mock('services/locale');
jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('modules');
