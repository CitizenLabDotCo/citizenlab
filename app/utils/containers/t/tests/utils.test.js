import { findTranslatedText } from '../utils';

describe('utils', () => {
  describe('findTranslatedText', () => {
    function run(userLocale, tenantLocales = []) {
      const exampleMultiloc = {
        en: 'Hello',
        nl: 'Hallo',
        fr: 'Bonjour',
      };

      return findTranslatedText(exampleMultiloc, userLocale, tenantLocales);
    }

    it('returns correct text when a entry exists for userLocale', () => {
      expect(run('en')).toEqual('Hello');
      expect(run('nl')).toEqual('Hallo');
      expect(run('fr')).toEqual('Bonjour');
    });

    it('returns correct text when a entry exists for one of tenantLocales in order', () => {
      expect(run('si', ['en', 'nl', 'fr'])).toEqual('Hello');
      expect(run('si', ['si', 'nl', 'fr'])).toEqual('Hallo');
      expect(run('si', ['si', 'ja', 'fr'])).toEqual('Bonjour');
    });
  });
});
