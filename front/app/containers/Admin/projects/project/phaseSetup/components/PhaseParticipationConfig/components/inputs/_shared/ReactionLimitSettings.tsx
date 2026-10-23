import React, { ReactNode } from 'react';

import { Box, Input, Radio, Text } from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/projects/project/messages';

import { useIntl } from 'utils/cl-intl';

type Method = 'unlimited' | 'limited';

interface Props {
  name: string;
  title: string;
  method: Method | null | undefined;
  max: number | null | undefined;
  maxLabel: string;
  error?: ReactNode;
  onMethodChange: (method: Method) => void;
  onMaxChange: (max: string) => void;
}

const ReactionLimitSettings = ({
  name,
  title,
  method,
  max,
  maxLabel,
  error,
  onMethodChange,
  onMaxChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" flexDirection="column" gap="8px" py="6px">
      <Text as="span" variant="boControl" m="0">
        {title}
      </Text>
      <Box display="flex" gap="20px">
        <Radio
          variant="bo"
          name={name}
          id={`${name}-unlimited`}
          value="unlimited"
          currentValue={method}
          onChange={onMethodChange}
          label={
            <Text as="span" variant="boControl" m="0">
              {formatMessage(messages.unlimited)}
            </Text>
          }
        />
        <Radio
          variant="bo"
          name={name}
          id={`${name}-limited`}
          value="limited"
          currentValue={method}
          onChange={onMethodChange}
          label={
            <Text as="span" variant="boControl" m="0">
              {formatMessage(messages.limited)}
            </Text>
          }
        />
      </Box>
      {method === 'limited' && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="12px"
        >
          <Text as="span" variant="boControl" m="0">
            {maxLabel}
          </Text>
          <Box width="72px">
            <Input
              id={`${name}-max`}
              ariaLabel={maxLabel}
              variant="bo"
              type="number"
              min="1"
              value={max ? max.toString() : null}
              onChange={onMaxChange}
            />
          </Box>
        </Box>
      )}
      {error}
    </Box>
  );
};

export default ReactionLimitSettings;
