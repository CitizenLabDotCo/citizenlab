import clHistory from 'utils/cl-router/history';

/**
 * Returns the user to where they were before a third-party auth/verification
 * round trip. Before redirecting we store the full path *and* query (e.g.
 * /projects/x/surveys/new?phase_id=...) in localStorage; navigating back to it
 * restores those params and drops the auth params the back-end appended to the
 * return URL (sso_success, sso_flow, ...). A full-page redirect already wiped
 * any in-memory state, so returning to the stored location is always correct.
 * Falls back to stripping the query off the current URL when nothing was
 * stored.
 */
export const restoreLocationAfterAuthReturn = (currentPathname: string) => {
  const pathFromLocalStorage = localStorage.getItem('auth_path');
  localStorage.removeItem('auth_path');

  if (pathFromLocalStorage) {
    clHistory.replace(pathFromLocalStorage);
  } else {
    // Remove query string from URL as params have already been captured.
    window.history.replaceState(null, '', currentPathname);
  }
};
