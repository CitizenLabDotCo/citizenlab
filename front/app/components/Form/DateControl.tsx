import React, { useState } from 'react';
import moment from 'moment';

import { withJsonFormsControlProps } from '@jsonforms/react';
import { Box, DateInput, IconTooltip } from 'cl2-component-library';
import {
  ControlProps,
  RankedTester,
  rankWith,
  isDateControl,
} from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import ErrorDisplay from './ErrorDisplay';
import { FormattedMessage, InjectedIntlProps } from 'react-intl';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import messages from './messages';
import styled from 'styled-components';

const StyledDateInput = styled(DateInput)`
  flex-grow: 1;
`;

const DateControl = ({
  uischema,
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
}: ControlProps & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);

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
        <StyledDateInput
          id={sanitizeForClassname(id)}
          value={data ? moment(data, 'YYYY-MM-DD') : null}
          onChange={(value) => {
            handleChange(path, value ? value.format('YYYY-MM-DD') : null);
            setDidBlur(true);
          }}
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

export default withJsonFormsControlProps(DateControl);

export const dateControlTester: RankedTester = rankWith(4, isDateControl);
