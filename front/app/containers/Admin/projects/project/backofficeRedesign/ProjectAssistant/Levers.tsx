import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { ProjectGenerationLevers } from 'api/project_generations/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import { LEVERS, LeverId } from './leverConfig';
import messages from './messages';

type Props = {
  values: ProjectGenerationLevers;
  disabled: boolean;
  onChange: (id: LeverId, value: number) => void;
};

const Levers = ({ values, disabled, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Text m="0px" mb="8px" variant="bodyS" color="textSecondary">
        {formatMessage(messages.leversHeading)}
      </Text>
      <Box display="flex" flexDirection="column" gap="12px">
        {LEVERS.map((lever) => (
          <Box key={lever.id}>
            <Text m="0px" mb="4px" fontSize="s" fontWeight="bold">
              {formatMessage(lever.question)}
            </Text>
            <Box display="flex" gap="6px">
              {lever.options.map((option, index) => (
                <ButtonWithLink
                  key={option.id}
                  type="button"
                  size="s"
                  padding="6px 8px"
                  buttonStyle={
                    values[lever.id] === index
                      ? 'primary'
                      : 'secondary-outlined'
                  }
                  width="100%"
                  disabled={disabled}
                  onClick={() => onChange(lever.id, index)}
                >
                  {formatMessage(option)}
                </ButtonWithLink>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Levers;
