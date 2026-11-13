import { isolatePreviewStorage } from './storage';

it('keeps preview storage and cookie changes out of the real session', () => {
  const localDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'localStorage'
  );
  const sessionDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'sessionStorage'
  );
  const local = window.localStorage;
  const session = window.sessionStorage;
  local.setItem('preview-test-login', 'existing-session');
  session.setItem('preview-test-preference', 'existing-value');
  document.cookie = 'preview_test_cookie=original; path=/';

  try {
    isolatePreviewStorage();
    expect(window.localStorage.getItem('preview-test-login')).toBe(
      'existing-session'
    );
    window.localStorage.clear();
    window.sessionStorage.setItem('preview-test-preference', 'changed');
    document.cookie = 'preview_test_cookie=changed; path=/';

    expect(local.getItem('preview-test-login')).toBe('existing-session');
    expect(session.getItem('preview-test-preference')).toBe('existing-value');
    expect(document.cookie).toContain('preview_test_cookie=original');
  } finally {
    if (localDescriptor) {
      Object.defineProperty(window, 'localStorage', localDescriptor);
    }

    if (sessionDescriptor) {
      Object.defineProperty(window, 'sessionStorage', sessionDescriptor);
    }

    Reflect.deleteProperty(document, 'cookie');
    local.removeItem('preview-test-login');
    session.removeItem('preview-test-preference');
    document.cookie = 'preview_test_cookie=; max-age=0; path=/';
  }
});
