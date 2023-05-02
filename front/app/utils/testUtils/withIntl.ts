import { WrappedComponentProps, createIntl } from 'react-intl';
import { shallow, ShallowRendererProps } from 'enzyme';
import React from 'react';
import messages from 'i18n/en';

const originalIntl = createIntl({ locale: 'en', messages });

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
  }) as React.ReactElement<P & WrappedComponentProps>;
}

// shallow() with React Intl context
export function shallowWithIntl<C extends React.Component, P = C['props']>(
  node: React.ReactElement<P>,
  additional: ShallowRendererProps = {}
) {
  const { context, ...options } = additional;
  return shallow(nodeWithIntlProp(node), {
    ...options,
    context: {
      ...context,
      intl,
    },
  });
}
