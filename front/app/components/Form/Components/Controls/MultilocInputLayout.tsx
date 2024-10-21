import React, { useContext } from 'react';

import { Layout, LayoutProps, rankWith, optionIs } from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';

import useLocale from 'hooks/useLocale';

import { FormContext } from 'components/Form/contexts';

import { isNilOrError } from 'utils/helperUtils';

const MultilocInputLayout = ({
  schema,
  uischema,
  path,
  renderers,
  cells,
  enabled,
}: LayoutProps) => {
  const platformLocale = useLocale();
  const ctx = useContext(FormContext);
  const locale = ctx.locale ?? platformLocale;

  if (isNilOrError(locale)) return null;

  const localizedElement =
    (uischema as Layout).elements.find(
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      (el) => el?.options?.locale === locale
    ) || // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (uischema as Layout).elements?.[0];

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (localizedElement) {
    return (
      <JsonFormsDispatch
        renderers={renderers}
        cells={cells}
        uischema={localizedElement}
        schema={schema}
        path={path}
        enabled={enabled}
      />
    );
  }
  return null;
};

export default withJsonFormsLayoutProps(MultilocInputLayout);

export const multilocInputTester = rankWith(
  1000,
  optionIs('render', 'multiloc')
);
