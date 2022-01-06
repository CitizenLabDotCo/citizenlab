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

const EnumControl = (props: ControlProps & InjectedIntlProps) => {
  const { data, handleChange, path, errors, schema, uischema, required, id } =
    props;
  const [didBlur, setDidBlur] = useState(false);
  const options = schema?.enumNames?.map((o, i) => ({
    value: schema.enum?.[i],
    label: o,
    // disabled?: boolean;
  }));
  console.log(schema, uischema);
  const descriptionJSX =
    schema?.description?.length > 0 ? (
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
          value={data}
          options={options}
          onChange={(val) => handleChange(path, val)}
          key={props.id}
          id={props.id}
          // disabled={props.disabled}
          aria-label={props.label}
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

export default withJsonFormsControlProps(injectIntl(EnumControl));

export const enumControlTester: RankedTester = rankWith(4, isEnumControl);
