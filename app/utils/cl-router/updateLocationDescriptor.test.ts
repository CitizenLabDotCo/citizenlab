import updateLocationDescriptor from 'utils/cl-router/updateLocationDescriptor';

import * as serviceLocale from 'services/locale';

const serviceSpy = jest.spyOn(serviceLocale, 'getUrlLocale');

test('updates / to /nl-BE/', () => {
  expect(updateLocationDescriptor('/', 'nl-BE')).toEqual({
    pathname: '/nl-BE/',
    state: {
      locale: 'nl-BE'
    }
  });
  expect(serviceSpy).toBeCalled;
});

test('updates /ideas to /nl-BE/ideas', () => {
  expect(updateLocationDescriptor('/ideas', 'nl-BE')).toEqual({
    pathname: '/nl-BE/ideas',
    state: {
      locale: 'nl-BE'
    }
  });
  expect(serviceSpy.mock.results[1]).toBeNull;
});

test('updates /fr-BE/ to /nl-BE/', () => {
  expect(updateLocationDescriptor('/fr-BE/', 'nl-BE')).toEqual({
    pathname: '/nl-BE/',
    state: {
      locale: 'nl-BE'
    }
  });
});

test('updates /fr-BE/ideas to /nl-BE/ideas', () => {
  expect(updateLocationDescriptor('/fr-BE/ideas', 'nl-BE')).toEqual({
    pathname: '/nl-BE/ideas',
    state: {
      locale: 'nl-BE'
    }
  });
});
