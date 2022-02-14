import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isOneOfControl,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import {
  Box,
  IconTooltip,
  IOption,
  Select,
} from '@citizenlab/cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import styled from 'styled-components';
import messages from './messages';

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
        htmlFor={sanitizeForClassname(id)}
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
          key={sanitizeForClassname(id)}
          id={sanitizeForClassname(id)}
          aria-label={getLabel(uischema, schema, path)}
          canBeEmpty={!required}
          disabled={uischema?.options?.readonly}
        />
        {uischema?.options?.verificationLocked && (
          <IconTooltip
            content={<FormattedMessage {...messages.blockedVerified} />}
            icon="lock"
            marginLeft="5px"
          />
        )}
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
    </>
  );
};

export default withJsonFormsControlProps(injectIntl(SingleSelectControl));

export const singleSelectControlTester: RankedTester = rankWith(
  4,
  isOneOfControl
);
