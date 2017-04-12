import React from 'react';
import { mount } from 'enzyme';
import { LocaleSelector } from '../index';

// import LocaleChanger from '../index';

describe('<LocaleChanger />', () => {
  it('should display current locale on load', () => {
    const jestFn = jest.fn();
    const locale = 'fr';
    const locales = [];
    locales.push({
      value: 'en',
      label: 'English',
    });
    locales.push({
      value: 'fr',
      label: 'French',
    });

    const wrapper = mount(<LocaleSelector
      userLocale={locale}
      options={locales}
      onLocaleChangeClick={jestFn}
    />);
    expect(wrapper.find('.Select-value-label').text()).toEqual(locales.filter((l) => l.value === locale)[0].label);
  });
});
