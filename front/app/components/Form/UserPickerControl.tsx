import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from '@jsonforms/core';
import React from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabelStyled } from 'components/UI/FormComponents';
import UserSelect from 'components/UI/UserSelect';
import messages from './messages';
import { Box } from 'cl2-component-library';

const UserPickerControl = (props: ControlProps & InjectedIntlProps) => {
  const {
    data,
    handleChange,
    path,
    errors,
    uischema,
    intl: { formatMessage },
  } = props;

  return (
    <Box id="e2e-idea-location-input" width="100%" marginBottom="40px">
      <FormLabelStyled>{uischema.label}</FormLabelStyled>
      <UserSelect
        id="author"
        inputId="author-select"
        value={data}
        onChange={(val) => {
          console.log(val);
          handleChange(path, val);
        }}
        placeholder={formatMessage(messages.userPickerPlaceholder)}
      />
      <ErrorDisplay ajvErrors={errors} fieldPath={path} />
    </Box>
  );
};

export default withJsonFormsControlProps(injectIntl(UserPickerControl));

export const userPickerControlTester: RankedTester = rankWith(
  4,
  scopeEndsWith('author_id')
);
