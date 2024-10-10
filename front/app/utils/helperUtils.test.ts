import {
  isNilOrError,
  isEmptyMultiloc,
  isNonEmptyString,
  isPage,
  isTopBarNavActive,
} from './helperUtils';

describe('isNilOrError', () => {
  test.each([
    [null, true],
    [undefined, true],
    [new Error(), true],
    [42, false],
    [{}, false],
  ])('gives the right result for %p', (val: any, expected: any) => {
    expect(isNilOrError(val)).toBe(expected);
  });
});

describe('isEmptyMultiloc', () => {
  it('returns true when the Multiloc is an empty object', () => {
    expect(isEmptyMultiloc({})).toBe(true);
  });

  it('returns true when the Multiloc has one or more language keys, but no corresponding value(s)', () => {
    expect(isEmptyMultiloc({ 'en-GB': '' })).toBe(true);
    expect(isEmptyMultiloc({ 'en-GB': '', 'nl-BE': '' })).toBe(true);
  });

  it('returns false when the Multiloc has a language key with a corresponding value', () => {
    expect(isEmptyMultiloc({ 'en-GB': 'Bla' })).toBe(false);
  });

  it("returns false when the Multiloc's first language key has no corresponding value, but the second has", () => {
    expect(isEmptyMultiloc({ 'en-GB': '', 'nl-BE': 'Bla' })).toBe(false);
  });

  it("returns false when the Multiloc's second language key has no corresponding value, but the first has", () => {
    expect(isEmptyMultiloc({ 'en-GB': 'Bla', 'nl-BE': '' })).toBe(false);
  });
});

describe('isNonEmptyString', () => {
  it('returns true for a string containing text', () => {
    expect(isNonEmptyString('This is text')).toBe(true);
  });

  it('returns true for a string containing text starts/ends with a whitespace', () => {
    expect(isNonEmptyString(' This is text ')).toBe(true);
  });

  it('returns false for an empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('returns false for a string containing only a whitespace', () => {
    expect(isNonEmptyString(' ')).toBe(false);
  });
});

describe('isPage', () => {
  describe('admin', () => {
    it('returns true for an admin path name', () => {
      expect(isPage('admin', '/en/admin/ideas')).toBe(true);
      expect(isPage('admin', '/en/admin/dashboard')).toBe(true);
    });

    it('returns false for a non-admin page', () => {
      expect(isPage('admin', '/en/ideas')).toBe(false);
    });
  });

  describe('idea_edit', () => {
    it('returns true we are at the idea edit form', () => {
      expect(
        isPage(
          'idea_edit',
          '/en/ideas/edit/9b49db98-7de5-4010-892c-5a15a89b0c56'
        )
      ).toBe(true);
    });

    it('returns false when we are not at the idea edit form', () => {
      expect(isPage('idea_edit', '/en/')).toBe(false);
      expect(isPage('idea_edit', '/en/admin/dashboard')).toBe(false);
      expect(
        isPage('idea_edit', '/en/ideas/edit-this-is-an-example-idea')
      ).toBe(false);
    });
  });
});

describe('isTopBarNavActive', () => {
  it('returns true when pathname and tabUrl end with basePath', () => {
    const basePath = '/dashboard';
    const pathname = '/user/dashboard';
    const tabUrl = '/user/dashboard';
    const result = isTopBarNavActive(basePath, pathname, tabUrl);
    expect(result).toBe(true);
  });

  it('returns false when tabUrl but not pathname ends with basePath', () => {
    const basePath = '/dashboard';
    const pathname = '/user/profile';
    const tabUrl = '/user/dashboard';
    const result = isTopBarNavActive(basePath, pathname, tabUrl);
    expect(result).toBe(false);
  });

  it('returns true when pathname includes tabUrl but tabUrl does not end with basePath', () => {
    const basePath = '/dashboard';
    const pathname = '/user/dashboard/edit/34';
    const tabUrl = '/dashboard/edit';
    const result = isTopBarNavActive(basePath, pathname, tabUrl);
    expect(result).toBe(true);
  });

  it('returns false when neither pathname ends with basePath nor pathname includes tabUrl', () => {
    const basePath = '/dashboard';
    const pathname = '/user/profile';
    const tabUrl = '/dashboard/edit';
    const result = isTopBarNavActive(basePath, pathname, tabUrl);
    expect(result).toBe(false);
  });
});
