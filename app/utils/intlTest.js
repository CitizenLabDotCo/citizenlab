import React from 'react';
import { IntlProvider, intlShape } from 'react-intl';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';

const messages = require('./../translations/en'); // en.json
const intlProvider = new IntlProvider({ locale: 'en', messages }, {});
const { intl } = intlProvider.getChildContext();

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
function nodeWithIntlProp(node) {
  return React.cloneElement(node, { intl });
}

function shallowWithIntl(node) {
  return shallow(nodeWithIntlProp(node), { context: { intl } });
}

function createComponentWithIntl(children, props = { locale: 'en' }) {
  return renderer.create(
    <IntlProvider {...props}>
      {children}
    </IntlProvider>
  );
}

function mountWithIntl(node) {
  return mount(nodeWithIntlProp(node), {
    context: { intl },
    childContextTypes: { intl: intlShape },
  });
}

export {
  shallowWithIntl,
  mountWithIntl,
  createComponentWithIntl,
};
