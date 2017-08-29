import { jestFn, stringMock } from 'utils/testing/constants';
import { mountWithIntl } from 'utils/testing/intl';
import { push } from 'react-router-redux';
import React from 'react';

import { mapDispatchToProps, SearchWidget } from '../index';
import { searchIdeasRequest } from '../actions';

describe('<SearchWidget />', () => {
  describe('mapDispatchToProps', () => {
    const dispatch = jestFn;
    const result = mapDispatchToProps(dispatch);

    describe('searchIdeas', () => {
      it('it should dispatch searchIdeasRequest', () => {
        result.searchIdeas(stringMock);
        expect(dispatch).toHaveBeenCalledWith(searchIdeasRequest(stringMock));
      });
    });

    describe('goToIdea', () => {
      it('should push with ideaId', () => {
        result.goToIdea(stringMock);
        expect(dispatch).toHaveBeenCalledWith(push(`/ideas/${stringMock}`));
      });
    });
  });

  describe('searchIdeas', () => {
    it('should set searchValue in component state', () => {
      const wrapper = mountWithIntl(<SearchWidget />);
      const searchFilter = 'anything';
      const wrapperInstante = wrapper.instance();
      wrapperInstante.searchIdeas(null, searchFilter);
      expect(wrapperInstante.state.searchValue).toEqual(searchFilter);
    });
  });
});
