import React from 'react';
import { objectMock } from 'utils/testing/constants';
import { mountWithIntl } from 'utils/testing/intl';

import IdeasSearchResult from '../IdeasSearchResult';

describe('<IdeasSearchResult />', () => {
  const titleMultiloc = objectMock;
  const wrapper = mountWithIntl(<IdeasSearchResult
    titleMultiloc={titleMultiloc}
  />);

  it('it should render T component', () => {
    expect(wrapper.find('T').length).toEqual(1);
  });

  it('it should have titleMultiloc prop', () => {
    expect(wrapper.prop('titleMultiloc')).toBeDefined();
  });
});
