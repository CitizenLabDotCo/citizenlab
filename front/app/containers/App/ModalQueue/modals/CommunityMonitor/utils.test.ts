import { isAllowedOnUrl } from './utils';

describe('isAllowedOnUrl', () => {
  it('returns true for homepage URL', () => {
    expect(isAllowedOnUrl('/en/')).toBeTruthy();
    expect(isAllowedOnUrl('/en')).toBeTruthy();
    expect(isAllowedOnUrl('/nl-NL/')).toBeTruthy();
    expect(isAllowedOnUrl('/nl-NL')).toBeTruthy();
    expect(isAllowedOnUrl('/sr-Latn/')).toBeTruthy();
    expect(isAllowedOnUrl('/sr-Latn')).toBeTruthy();
  });

  it('returns true for custom page URL', () => {
    expect(isAllowedOnUrl('/en/pages/custom-page')).toBeTruthy();
    expect(isAllowedOnUrl('/nl-NL/pages/custom-page')).toBeTruthy();
  });
});
