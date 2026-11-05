import clHistory from 'utils/cl-router/history';

import { restoreLocationAfterAuthReturn } from './restoreLocationAfterAuthReturn';

jest.mock('utils/cl-router/history', () => ({
  __esModule: true,
  default: { replace: jest.fn(), push: jest.fn() },
}));

const mockReplace = clHistory.replace as jest.Mock;

const SURVEY_PATH_WITH_QUERY =
  '/en/projects/my-project/surveys/new?phase_id=phase-1';
const CURRENT_PATHNAME = '/en/projects/my-project/surveys/new';

describe('restoreLocationAfterAuthReturn (SSO/verification return navigation)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    localStorage.clear();
  });

  it('navigates back to the stored full path, restoring its query params', () => {
    // The full path + query the user was on before the SSO round trip.
    localStorage.setItem('auth_path', SURVEY_PATH_WITH_QUERY);

    restoreLocationAfterAuthReturn(CURRENT_PATHNAME);

    // phase_id is restored; the auth params the back-end appended are dropped.
    expect(mockReplace).toHaveBeenCalledWith(SURVEY_PATH_WITH_QUERY);
  });

  it('consumes auth_path from localStorage so it is not reused', () => {
    localStorage.setItem('auth_path', SURVEY_PATH_WITH_QUERY);

    restoreLocationAfterAuthReturn(CURRENT_PATHNAME);

    expect(localStorage.getItem('auth_path')).toBeNull();
  });

  it('strips the query string off the current URL when no path was stored', () => {
    const replaceStateSpy = jest.spyOn(window.history, 'replaceState');

    restoreLocationAfterAuthReturn(CURRENT_PATHNAME);

    expect(mockReplace).not.toHaveBeenCalled();
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', CURRENT_PATHNAME);

    replaceStateSpy.mockRestore();
  });
});
