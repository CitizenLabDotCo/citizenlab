import { mapDispatchToProps } from '../index';
import { changeLocale } from '../../LanguageProvider/actions';

describe('mapDispatchToProps', () => {
  describe('onLocaleChangeClick', () => {
    it('should dispatch changeLocale', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const locale = 'en';
      result.onLocaleChangeClick(locale);
      expect(dispatch).toHaveBeenCalledWith(changeLocale(locale));
    });
  });
});
