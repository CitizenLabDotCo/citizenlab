import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { render } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import T from '../index';

const fakeStore = configureMockStore([])(fromJS({
  persistedData: {
    userLocale: 'fr',
    tenantLocales: ['en', 'nl', 'fr'],
  },
}));

describe('<T />', () => {
  const exampleMultiloc = {
    en: 'Hello',
    nl: 'Hallo',
    fr: 'Bonjour',
  };

  it('renders correctly', () => {
    const component = render(
      <Provider store={fakeStore}>
        <T value={exampleMultiloc} />
      </Provider>
    );

    expect(component.text()).toEqual('Bonjour');
  });
});

