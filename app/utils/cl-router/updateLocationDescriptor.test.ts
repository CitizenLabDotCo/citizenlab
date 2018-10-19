import updateLocationDescriptor from './updateLocationDescriptor';

import * as serviceLocale from 'services/locale';

jest.spyOn(serviceLocale, 'getUrlLocale').mockReturnValue('fr-be');

test('updates "/fr-BE" to "/nl-BE"', () => {
  expect(updateLocationDescriptor('/fr-BE', 'nl-BE')).toBe({
    pathname: '/nl-BE',
    state: 'nl-BE'
  });
});
