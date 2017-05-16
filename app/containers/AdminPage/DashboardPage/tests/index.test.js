import { mapDispatchToProps } from '../index';
import { loadReportsRequest } from '../actions';

describe('<AdminPages />', () => {
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    const result = mapDispatchToProps(dispatch);

    describe('loadReportsRequest', () => {
      it('should dispatch loadReportsRequest action', () => {
        result.loadReports();
        expect(dispatch).toHaveBeenCalledWith(loadReportsRequest);
      });
    });
  });
});
