import {
  sum,
  isNilOrError,
  isEmptyMultiloc,
  isNonEmptyString,
  isPage,
} from './helperUtils';

jest.mock('modules', () => ({ streamsToReset: [] }));

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

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

  describe('initiative_form', () => {
    it('returns true we are at the new initiative form', () => {
      expect(isPage('initiative_form', '/nl-BE/initiatives/new')).toBe(true);
    });

    it('returns false when we are not at the new initiative form', () => {
      expect(isPage('initiative_form', '/en/')).toBe(false);
      expect(isPage('initiative_form', '/en/initiatives/new-playground')).toBe(
        false
      );
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
      expect(isPage('idea_edit', '/en/initiatives/new-playground')).toBe(false);
      expect(isPage('idea_edit', '/en/admin/dashboard')).toBe(false);
      expect(
        isPage('idea_edit', '/en/ideas/edit-this-is-an-example-idea')
      ).toBe(false);
    });
  });
});
