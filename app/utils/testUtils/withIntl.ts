import { IntlProvider, intlShape, InjectedIntlProps } from 'react-intl';
import { shallow, mount, ShallowRendererProps, ShallowWrapper } from 'enzyme';
import React from 'react';

// Create IntlProvider to retrieve React Intl context
const intlProvider = new IntlProvider({
  locale: 'en',
}, {});

// You customize the intl object here:
const { intl: originalIntl } = intlProvider.getChildContext() as InjectedIntlProps;
const intl = {
  ...originalIntl,
  formatMessage: ({ id, defaultMessage }, values?) =>
    originalIntl.formatMessage({
      id,
      defaultMessage: defaultMessage || id
    }, { tenantName: 'The Test', orgName: 'Test Town', orgType: 'testing', ...values || {} }),
};

const nodeWithIntlProp = (node) => React.cloneElement(node, { intl });

// shallow() with React Intl context
export function shallowWithIntl<C extends React.Component, P = C['props'], S = C['state']>(node: React.ReactElement<P>, additional: ShallowRendererProps = {}) {
 const { context, ...options } = additional;
  return shallow(nodeWithIntlProp(node), {
    ...options,
    context: {
      ...context,
      intl
    }
  }) as ShallowWrapper<P & InjectedIntlProps, S, C>;
}

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
