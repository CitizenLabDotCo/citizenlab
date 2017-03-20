import { mapDispatchToProps } from '../index';

describe('<ProfilePage />', () => {
  describe('mapDispatchToProps', () => {
    describe('initData', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.initData).toBeDefined();
      });
    });
  });
});
