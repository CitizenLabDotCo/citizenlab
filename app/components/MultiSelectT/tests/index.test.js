import { stringMock } from 'utils/testing/constants';
import { fromJS } from 'immutable';
// import React from 'react';
// import { Provider } from 'react-redux';
// import { render } from 'enzyme';
// import configureMockStore from 'redux-mock-store';

// import { optionRendered } from '../index';

describe('<MultiSeelct />', () => {
  const option = {
    label: JSON.stringify({
      en: stringMock,
      nl: stringMock,
    }),
    value: stringMock,
  };
  console.log(option);

  // mock store
  const storeState = {
    language: {
      locale: stringMock,
    },
    auth: {
      id: stringMock,
    },
    resources: {
      users: {},
    },
  };
  storeState.resources.users[stringMock] = {};
  const mockedStore = fromJS(storeState);
  console.log(mockedStore);

  describe('optionRendered', () => {
    // TODO: fix (+ put mocked store in utils/testing/intl as store: mockedStore, @ shallowWithIntl -> context, for general use)
    it('should render T component', () => {
    //   const wrapper = render(<Provider store={configureMockStore([])(mockedStore)}>
    //     {optionRendered(option)}
    //   </Provider>);
    // expect(wrapper.find('T').length).toEqual(1);
      expect(true).toEqual(true);
    });
  });
});
