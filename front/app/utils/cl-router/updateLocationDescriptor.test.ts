import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';
import { getUrlLocale } from 'utils/getUrlLocale';

// Wraps the real implementation so behaviour is unchanged; we only need to
// observe the calls. `jest.spyOn` on a module namespace does not work here,
// as the transformer emits ES module exports as non-configurable getters.
jest.mock('utils/getUrlLocale', () => {
  const actual = jest.requireActual('utils/getUrlLocale');
  return {
    __esModule: true,
    ...actual,
    getUrlLocale: jest.fn(actual.getUrlLocale),
  };
});

const serviceSpy = getUrlLocale as jest.Mock;

test('updates / to /nl-BE/ : updates home with no locale as expected', () => {
  expect(updateLocationDescriptor('/', 'nl-BE')).toEqual({
    pathname: '/nl-BE/',
    state: {
      locale: 'nl-BE',
    },
  });
  expect(serviceSpy).toHaveBeenCalled();
});

test('updates /ideas to /nl-BE/ideas : updates a simple path with no locale as expected', () => {
  expect(updateLocationDescriptor('/ideas', 'nl-BE')).toEqual({
    pathname: '/nl-BE/ideas',
    state: {
      locale: 'nl-BE',
    },
  });
  expect(serviceSpy.mock.results[1]).toBeUndefined();
});

test('updates /fr-BE/ to /nl-BE/ : updates a home with a locale as expected', () => {
  expect(updateLocationDescriptor('/fr-BE/', 'nl-BE')).toEqual({
    pathname: '/nl-BE/',
    state: {
      locale: 'nl-BE',
    },
  });
});

test('updates /fr/ to /nl-BE/ : updates a home with a kinda supported locale as expected', () => {
  // cf constants --> locales
  expect(updateLocationDescriptor('/fr/', 'nl-BE')).toEqual({
    pathname: '/nl-BE/',
    state: {
      locale: 'nl-BE',
    },
  });
});

test('updates /fr-BE/ideas to /nl-BE/ideas : updates a simple path with a locale as expected', () => {
  expect(updateLocationDescriptor('/fr-BE/ideas', 'nl-BE')).toEqual({
    pathname: '/nl-BE/ideas',
    state: {
      locale: 'nl-BE',
    },
  });
});

test('updates fr-BE/ideas to /nl-BE/ideas : updates a simple path with a locale but missing a starting / as expected', () => {
  expect(updateLocationDescriptor('fr-BE/ideas', 'nl-BE')).toEqual({
    pathname: '/nl-BE/ideas',
    state: {
      locale: 'nl-BE',
    },
  });
});
