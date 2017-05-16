import { stringMock } from 'utils/testing/constants';
import { push } from 'react-router-redux';

import { mapDispatchToProps } from '../index';

describe('<AdminPages />', () => {
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    const result = mapDispatchToProps(dispatch);

    describe('routeToPage', () => {
      it('should dispatch push action with provided page id', () => {
        const pageId = stringMock;
        result.routeToPage(pageId);
        expect(dispatch).toHaveBeenCalledWith(push(`/pages/${pageId}`));
      });
    });
  });
});
