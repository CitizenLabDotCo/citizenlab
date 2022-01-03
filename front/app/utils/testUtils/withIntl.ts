import { IntlProvider, InjectedIntlProps } from 'react-intl';
import { shallow, ShallowRendererProps, ShallowWrapper } from 'enzyme';
import React from 'react';

// Create IntlProvider to retrieve React Intl context
const intlProvider = new IntlProvider(
  {
    locale: 'en',
  },
  {}
);

// You customize the intl object here:
const { intl: originalIntl } =
  intlProvider.getChildContext() as InjectedIntlProps;
const intl = {
  ...originalIntl,
  formatMessage: ({ id, defaultMessage }, values?) =>
    originalIntl.formatMessage(
      {
        id,
        defaultMessage: defaultMessage || id,
      },
      {
        tenantName: 'The Test',
        orgName: 'Test Town',
        orgType: 'testing',
        ...(values || {}),
      }
    ),
};

function nodeWithIntlProp<P>(node: React.ReactElement<P>) {
  return React.cloneElement(node as React.ReactElement<any>, {
    intl,
  }) as React.ReactElement<P & InjectedIntlProps>;
}

// shallow() with React Intl context
export function shallowWithIntl<
  C extends React.Component,
  P = C['props'],
  S = C['state']
>(node: React.ReactElement<P>, additional: ShallowRendererProps = {}) {
  const { context, ...options } = additional;
  return shallow(nodeWithIntlProp(node), {
    ...options,
    context: {
      ...context,
      intl,
    },
  }) as ShallowWrapper<P & InjectedIntlProps, S, C>;
}
