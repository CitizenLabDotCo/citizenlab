import { isValidUrl } from './validate';

describe('isValidUrl', () => {
  it('tests valid URLs', () => {
    expect(isValidUrl('https://www.example.com')).toStrictEqual(true);
    expect(isValidUrl('http://www.example.com')).toStrictEqual(true);
    expect(isValidUrl('https://example.com')).toStrictEqual(true);
    expect(
      isValidUrl('https://example.reallyreallysuperduperlongurlsuffix')
    ).toStrictEqual(true);
  });
  it('tests invalid URLs', () => {
    expect(isValidUrl('www.example.com')).toStrictEqual(false);
    expect(isValidUrl('https://e.com')).toStrictEqual(false);
    expect(isValidUrl('https://example.c')).toStrictEqual(false);
    expect(isValidUrl('https://example')).toStrictEqual(false);
  });
});
