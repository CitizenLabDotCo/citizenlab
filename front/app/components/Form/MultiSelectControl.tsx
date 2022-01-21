import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isPrimitiveArrayControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { Box } from 'cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel } from 'utils/JSONFormUtils';
import styled from 'styled-components';
import MultipleSelect from 'components/UI/MultipleSelect';

const StyledMultipleSelect = styled(MultipleSelect)`
  flex-grow: 1;
`;

const MultiSelectControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  required,
  id,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const options = schema.items?.enum?.map((o, i) => ({
    value: o,
    label: schema?.items?.enumNames?.[i] || o,
  }));

  return (
    <>
      <FormLabel
        htmlFor={id}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row" overflow="visible">
        <StyledMultipleSelect
          value={data}
          options={options}
          onChange={(vals) => {
            setDidBlur(true);
            handleChange(
              path,
              vals.map((val) => val.value)
            );
          }}
          inputId={id}
        />
        <ErrorDisplay
          ajvErrors={didBlur ? errors : undefined}
          fieldPath={path}
        />
      </Box>
    </>
  );
};
// {props.options.verificationLocked && (
//   <IconTooltip
//     content={<FormattedMessage {...messages.blockedVerified} />}
//     icon="lock"
//   />
// )}

export default withJsonFormsControlProps(injectIntl(MultiSelectControl));

export const multiSelectControlTester: RankedTester = rankWith(
  4,
  isPrimitiveArrayControl
);
