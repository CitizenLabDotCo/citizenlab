import { IntlProvider, intlShape } from "react-intl";
import { shallow, mount } from "enzyme";
import React from 'react';

// Create IntlProvider to retrieve React Intl context
const intlProvider = new IntlProvider(
  {
    locale: "en",
    messages: {
      message1: "Hello world"
    }
  },
  {}
);
const { intl } = intlProvider.getChildContext();

// `intl` prop is required when using injectIntl HOC
const nodeWithIntlProp = node => React.cloneElement(node, { intl });

// shallow() with React Intl context
export const shallowWithIntl = (node, { context, ...options } = {}) => {
  return shallow(nodeWithIntlProp(node), {
    ...options,
    context: {
      ...context,
      intl
    }
  });
};

// mount() with React Intl context
export const mountWithIntl = (
  node,
  { context, childContextTypes, ...options } = {}
) => {
  return mount(nodeWithIntlProp(node), {
    ...options,
    context: {
      ...context,
      intl
    },
    childContextTypes: {
      intl: intlShape,
      ...childContextTypes
    }
  });
};
