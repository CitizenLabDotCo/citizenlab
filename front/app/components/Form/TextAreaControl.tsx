import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  optionIs,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { FormattedMessage, InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import TextArea from 'components/UI/TextArea';
import { isString } from 'utils/helperUtils';
import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import messages from './messages';
import styled from 'styled-components';

const StyledTextArea = styled(TextArea)`
  flex-grow: 1;
`;

const TextAreaControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  id,
  required,
  uischema,
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
        <StyledTextArea
          onChange={(value) => handleChange(path, value)}
          rows={6}
          value={data}
          id={sanitizeForClassname(id)}
          onBlur={() => {
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              handleChange(path, data.trim());
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

export default withJsonFormsControlProps(TextAreaControl);

export const textAreaControlTester: RankedTester = rankWith(
  4,
  optionIs('textarea', true)
);
