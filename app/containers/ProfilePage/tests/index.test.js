// import { shallow } from 'enzyme';

import { mapDispatchToProps } from '../index';
import { storeProfile } from '../actions';

describe('<ProfilePage />', () => {
  describe('mapDispatchToProps', () => {
    describe('onSubmitForm', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onSubmitForm).toBeDefined();
      });

      // TODO: fix the following tests
      it('should dispatch storeProfile when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        const values = {
          firstName: 'X',
          lastName: 'Y',
          gender: 'Male',
          email: 'a@b.cd',
        };

        result.onSubmitForm({ target: { value: values } });
        expect(dispatch).toHaveBeenCalledWith(storeProfile(values));
      });

      it('should preventDefault if called with event', () => {
        const preventDefault = jest.fn();
        const result = mapDispatchToProps(() => {
        });
        const evt = { preventDefault };
        result.onSubmitForm(evt);
        expect(preventDefault).toHaveBeenCalledWith();
      });
    });
  });
});
