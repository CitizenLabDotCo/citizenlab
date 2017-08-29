import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider, intlShape } from 'react-intl';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import { jestFn } from './constants';

const messages = require('../../translations/en'); // en.json
const intlProvider = new IntlProvider({ locale: 'en', messages }, {});
const { intl } = intlProvider.getChildContext();

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
function nodeWithIntlProp(node) {
  return React.cloneElement(node, {
    intl,
    sagas: [],
  });
}

function shallowWithIntl(node) {
  return shallow(nodeWithIntlProp(node), {
    context: {
      intl,
    },
  });
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
    context: {
      intl,
      sagas: {
        run: jestFn,
      },
    },
    childContextTypes: {
      intl: intlShape,
      sagas: PropTypes.func.isRequired,
    },
  });
}

export {
  shallowWithIntl,
  mountWithIntl,
  createComponentWithIntl,
};
