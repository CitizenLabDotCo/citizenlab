import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isOneOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { Box, IOption, Select } from 'cl2-component-library';
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
    schema?.oneOf
      ?.map((o) => ({
        value: o.const,
        label: o.title || o.const,
      }))
      .filter((e) => e.value && e.label) || null;

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
          options={options as IOption[]}
          onChange={(val) => {
            setDidBlur(true);
            handleChange(path, val?.value);
          }}
          key={id}
          id={id}
          // disabled={disabled}
          aria-label={getLabel(uischema, schema, path)}
          canBeEmpty={true}
        />
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
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
  isOneOfControl
);
