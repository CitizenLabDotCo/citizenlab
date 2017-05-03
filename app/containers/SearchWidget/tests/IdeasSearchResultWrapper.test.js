import React from 'react';
import { shallow } from 'enzyme';
import { objectMock, jestFn } from 'utils/testing/constants';

import IdeasSearchResultWrapper from '../IdeasSearchResultWrapper';
import IdeasSearchResult from '../IdeasSearchResult';

describe('<IdeasSearchResultWrapper />', () => {
  const childWrapper = shallow(<IdeasSearchResult
    titleMultiloc={objectMock}
  />);
  const wrapper = shallow(<IdeasSearchResultWrapper
    onClick={jestFn}
  >{childWrapper}</IdeasSearchResultWrapper>);

  it('should return its own children', () => {
    expect(wrapper.find('button').prop('children')).toEqual(childWrapper);
  });

  it('should have onClick prop (passed down to children)', () => {
    // the prop is passed down to children by <Search> widget part of Semantic UI
    expect(wrapper.find('button').prop('onClick')).toBeDefined();
  });
});
