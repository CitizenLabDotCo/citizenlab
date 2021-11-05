import { rankWith } from '@jsonforms/core';
import {
  ResolvedJsonFormsDispatch,
  withJsonFormsLayoutProps,
} from '@jsonforms/react';
import { Box } from 'cl2-component-library';
import { FormLabelStyled } from 'components/UI/FormComponents';
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
  console.log(schema, uischema, path);

  const localizedElement =
    uischema.elements.find((el) => el.locale === locale) ||
    uischema.elements?.[0];

  if (localizedElement) {
    return (
      <Box id="e2e-idea-title-input" width="100%" marginBottom="40px">
        <FormLabelStyled>{localizedElement.label}</FormLabelStyled>
        <ResolvedJsonFormsDispatch
          renderers={renderers}
          cells={cells}
          uischema={localizedElement}
          schema={schema}
          path={path}
          enabled={enabled}
        />
      </Box>
    );
  }
  return null;
};

export default withJsonFormsLayoutProps(MultilocInputLayout);

export const multilocInputTester = rankWith(
  3,
  (schema) => schema?.['render'] === 'multiloc'
);
