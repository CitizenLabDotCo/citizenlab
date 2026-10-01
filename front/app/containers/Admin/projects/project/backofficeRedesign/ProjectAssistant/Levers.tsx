import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ProjectGenerationLevers } from 'api/project_generations/types';

import { useIntl } from 'utils/cl-intl';

import { LEVERS, LeverId } from './leverConfig';
import messages from './messages';

// The questions slide in once there's a brief to shape, so they feel like a
// response to what you typed rather than a form waiting up front.
const Reveal = styled(Box)`
  @keyframes leversReveal {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: leversReveal 180ms ease both;
`;

// Soft rounded chips — lighter than the primary buttons, and teal (the
// assistant's colour) so they read as the assistant's own controls, distinct
// from the navy "Draft" action.
const Chip = styled.button<{ $selected: boolean }>`
  appearance: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.2;
  padding: 7px 13px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  border: 1px solid
    ${({ $selected }) => ($selected ? colors.teal500 : colors.grey300)};
  background: ${({ $selected }) => ($selected ? colors.teal500 : '#fff')};
  color: ${({ $selected }) => ($selected ? '#fff' : colors.textPrimary)};
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};

  &:hover:not(:disabled) {
    border-color: ${({ $selected }) =>
      $selected ? colors.teal700 : colors.grey400};
    background: ${({ $selected }) =>
      $selected ? colors.teal700 : colors.grey100};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

type Props = {
  values: ProjectGenerationLevers;
  disabled: boolean;
  onChange: (id: LeverId, value: number) => void;
};

const Levers = ({ values, disabled, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Reveal pt="20px" borderTop={`1px solid ${colors.grey200}`}>
      <Text m="0px" mb="2px" fontSize="m" fontWeight="bold">
        {formatMessage(messages.leversHeading)}
      </Text>
      <Text m="0px" mb="16px" fontSize="s" color="textSecondary" lineHeight="1.45">
        {formatMessage(messages.leversHelper)}
      </Text>
      <Box display="flex" flexDirection="column" gap="16px">
        {LEVERS.map((lever) => (
          <Box key={lever.id}>
            <Text m="0px" mb="8px" fontSize="s" color="textPrimary">
              {formatMessage(lever.question)}
            </Text>
            <Box display="flex" flexWrap="wrap" gap="7px">
              {lever.options.map((option, index) => (
                <Chip
                  key={option.id}
                  type="button"
                  $selected={values[lever.id] === index}
                  disabled={disabled}
                  onClick={() => onChange(lever.id, index)}
                >
                  {formatMessage(option)}
                </Chip>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Reveal>
  );
};

export default Levers;
