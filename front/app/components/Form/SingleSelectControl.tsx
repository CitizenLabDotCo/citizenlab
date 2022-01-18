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
import { FormLabelValue } from 'components/UI/FormComponents';
import { getLabel } from 'utils/JSONFormUtils';
import styled from 'styled-components';

const StyledSelect = styled(Select)`
  flex-grow: 1;
`;

const SingleSelectControl = (props: ControlProps & InjectedIntlProps) => {
  const {
    data,
    handleChange,
    path,
    errors,
    schema,
    uischema,
    required,
    id,
    label,
  } = props;
  const [didBlur, setDidBlur] = useState(false);
  const options =
    schema?.enum?.map((o, i) => ({
      value: o,
      label: schema.enumNames?.[i] || o.toString(),
    })) || null;

  const descriptionJSX =
    schema && schema?.description && schema?.description?.length > 0 ? (
      <div dangerouslySetInnerHTML={{ __html: schema.description }} />
    ) : undefined;

  return (
    <>
      <FormLabelValue
        htmlFor={id}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={descriptionJSX}
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
          aria-label={label}
          canBeEmpty={true}
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

export default withJsonFormsControlProps(injectIntl(SingleSelectControl));

export const singleSelectControlTester: RankedTester = rankWith(
  4,
  isEnumControl
);
