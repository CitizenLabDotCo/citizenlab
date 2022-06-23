import React from 'react';
import { Layout, LayoutProps, rankWith, optionIs } from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

const MultilocInputLayout = ({
  schema,
  uischema,
  path,
  renderers,
  cells,
  enabled,
}: LayoutProps) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const localizedElement =
    (uischema as Layout).elements.find(
      (el) => el?.options?.locale === locale
    ) || (uischema as Layout).elements?.[0];

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
