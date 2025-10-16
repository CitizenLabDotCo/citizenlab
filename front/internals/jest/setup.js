import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'whatwg-fetch';

Object.assign(global, { TextDecoder, TextEncoder });

global.ResizeObserver = require('resize-observer-polyfill');

jest.mock('polished');
jest.mock('@enzedonline/quill-blot-formatter2');
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
jest.mock('utils/locale');
jest.mock('utils/localeStream');
jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('modules');
jest.mock('js-confetti', () => jest.fn(() => ({ addConfetti: jest.fn() })));
