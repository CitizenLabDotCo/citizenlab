import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import {
  ControlProps,
  optionIs,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import { withJsonFormsControlProps } from '@jsonforms/react';
import styled from 'styled-components';

import { FormLabel } from 'components/UI/FormComponents';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage } from 'utils/cl-intl';
import { isString } from 'utils/helperUtils';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../ErrorDisplay';
import VerificationIcon from '../VerificationIcon';

import { getSubtextElement } from './controlUtils';
import messages from './messages';

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
  visible,
}: ControlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const answerNotPublic = uischema.options?.answer_visible_to === 'admins';

  if (!visible) {
    return null;
  }

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={getSubtextElement(uischema.options?.description)}
        subtextSupportsHtml
      />
      {answerNotPublic && (
        <Text mb="8px" mt="0px" fontSize="s">
          <FormattedMessage {...messages.notPublic} />
        </Text>
      )}
      <Box display="flex" flexDirection="row">
        <StyledTextArea
          onChange={(value) => handleChange(path, value)}
          rows={6}
          value={data}
          id={sanitizeForClassname(id)}
          onBlur={() => {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            uischema?.options?.transform === 'trim_on_blur' &&
              isString(data) &&
              handleChange(path, data.trim());
            setDidBlur(true);
          }}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          disabled={uischema?.options?.readonly}
        />
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        <VerificationIcon show={uischema?.options?.verificationLocked} />
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default withJsonFormsControlProps(TextAreaControl);

export const textAreaControlTester: RankedTester = rankWith(
  10,
  optionIs('textarea', true)
);
