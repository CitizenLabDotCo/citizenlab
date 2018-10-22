import updateLocationDescriptor from './updateLocationDescriptor';

import * as serviceLocale from '../../services/locale';

jest.spyOn(serviceLocale, 'getUrlLocale').mockReturnValue('fr-be');

test('updates "/fr-BE" to "/nl-BE"', () => {
  expect(updateLocationDescriptor('/nl-BE', 'fr-BE')).toEqual({
    pathname: '/nl-BE',
    state: {
      locale: 'fr-BE'
    }
  });
});
