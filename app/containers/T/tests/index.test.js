import React from 'react';
import { shallow } from 'enzyme';

import { T } from '../index';

// TODO: test connected component

describe('<T />', () => {
  const exampleMultiloc = {
    en: 'Hello',
    nl: 'Hallo',
    fr: 'Bonjour',
  };

  const fakeStore = {
    userLocale: 'fr',
    tenantLocales: ['en', 'nl', 'fr'],
  };

  it('renders correctly', () => {
    const component = shallow(
      <T
        value={exampleMultiloc}
        userLocale={fakeStore.userLocale}
        tenantLocales={fakeStore.tenantLocales}
      />
    );

    expect(component.text()).toEqual('Bonjour');
  });
});

