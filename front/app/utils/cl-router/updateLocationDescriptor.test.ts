import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';

import * as serviceLocale from 'utils/locale';

const serviceSpy = jest.spyOn(serviceLocale, 'getUrlLocale');

test('updates / to /nl-BE/ : updates home with no locale as expected', () => {
  expect(updateLocationDescriptor('/', 'nl-BE')).toEqual({
    pathname: '/nl-BE/',
    state: {
      locale: 'nl-BE',
    },
  });
  expect(serviceSpy).toBeCalled;
});

test('updates /ideas to /nl-BE/ideas : updates a simple path with no locale as expected', () => {
  expect(updateLocationDescriptor('/ideas', 'nl-BE')).toEqual({
    pathname: '/nl-BE/ideas',
    state: {
      locale: 'nl-BE',
    },
  });
  expect(serviceSpy.mock.results[1]).toBeNull;
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
