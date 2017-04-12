import { mapDispatchToProps } from '../index';
import { updateLocale } from '../actions';

describe('mapDispatchToProps', () => {
  describe('onLocaleChangeClick', () => {
    it('should dispatch updateLocale', () => {
      const dispatch = jest.fn();
      const result = mapDispatchToProps(dispatch);
      const locale = 'en';
      result.onLocaleChangeClick(locale);
      expect(dispatch).toHaveBeenCalledWith(updateLocale(locale));
    });
  });
});
