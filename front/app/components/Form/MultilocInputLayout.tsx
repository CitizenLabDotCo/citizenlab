import { rankWith } from '@jsonforms/core';
import {
  ResolvedJsonFormsDispatch,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import useLocale from 'hooks/useLocale';
import React from 'react';
// import { Multiloc } from "typings";
import { isNilOrError } from 'utils/helperUtils';

const MultilocInputLayout = ({
  schema,
  uischema,
  path,
  renderers,
  cells,
  enabled,
}: any) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;
  console.log(schema);

  const localizedElement =
    uischema.elements.find((el) => el.scope.endsWith(locale)) ||
    uischema.elements?.[0];
  if (localizedElement) {
    return (
      <ResolvedJsonFormsDispatch
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
  3,
  (schema) => schema?.['render'] === 'multiloc'
);
