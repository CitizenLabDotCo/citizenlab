import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isEnumControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { Box, Select } from 'cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel } from 'utils/JSONFormUtils';
import styled from 'styled-components';

const StyledSelect = styled(Select)`
  flex-grow: 1;
`;

const SingleSelectControl = ({
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
  const options =
    schema?.enum?.map((o, i) => ({
      value: o,
      label: schema.enumNames?.[i] || o.toString(),
    })) || null;

  return (
    <>
      <FormLabel
        htmlFor={id}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="row">
        <StyledSelect
          value={{
            value: data,
            label: 'any',
          }} /* sad workaround waiting for PR in component library */
          options={options}
          onChange={(val) => {
            setDidBlur(true);
            handleChange(path, val.value);
          }}
          key={id}
          id={id}
          // disabled={disabled}
          aria-label={getLabel(uischema, schema, path)}
          canBeEmpty={true}
        />
      </Box>
      <ErrorDisplay ajvErrors={didBlur ? errors : undefined} fieldPath={path} />
    </>
  );
};
// {props.options.verificationLocked && (
//   <IconTooltip
//     content={<FormattedMessage {...messages.blockedVerified} />}
//     icon="lock"
//   />
// )}

export default withJsonFormsControlProps(injectIntl(SingleSelectControl));

export const singleSelectControlTester: RankedTester = rankWith(
  4,
  isEnumControl
);
