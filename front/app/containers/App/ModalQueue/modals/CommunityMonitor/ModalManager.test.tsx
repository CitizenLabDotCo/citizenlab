import { isAllowedOnUrl } from './utils';

describe('isAllowedOnUrl', () => {
  it('should return true for URLs containing /pages/', () => {
    expect(isAllowedOnUrl('/pages/custom-page')).toBeTruthy();
    expect(isAllowedOnUrl('/pages/about-us')).toBeTruthy();
  });

  it('should return true for homepage URLs with language prefix', () => {
    expect(isAllowedOnUrl('/en/')).toBeTruthy();
    expect(isAllowedOnUrl('/fr/')).toBeTruthy();
    expect(isAllowedOnUrl('/de/')).toBeTruthy();
  });

  it('should return false for URLs that are not custom pages or homepages', () => {
    expect(isAllowedOnUrl('/en/dashboard')).toBeFalsy();
    expect(isAllowedOnUrl('/api/data')).toBeFalsy();
    expect(isAllowedOnUrl('/random/path')).toBeFalsy();
  });

  it('should handle edge cases correctly', () => {
    expect(isAllowedOnUrl('/pages-fake/')).toBeFalsy(); // Should not match "/pages-fake/"
    expect(isAllowedOnUrl('/pagesanything')).toBeFalsy(); // Should not match "/pagesanything"
    expect(isAllowedOnUrl('/')).toBeFalsy(); // Root without language prefix
    expect(isAllowedOnUrl('/en')).toBeFalsy(); // Missing trailing slash
  });
});
