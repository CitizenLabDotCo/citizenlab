import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

export interface Step {
  name: string;
  label: MessageDescriptor;
  done: boolean;
  onClick: () => void;
}

interface Props {
  step: Step;
  isLast: boolean;
}

const StepRow = ({ step, isLast }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12px"
      py="12px"
      borderBottom={isLast ? 'none' : `1px solid ${colors.grey200}`}
    >
      {step.done ? (
        <Icon
          name="check-circle"
          width="18px"
          height="18px"
          fill={colors.textPrimary}
          my="0px"
        />
      ) : (
        <Box
          flex="0 0 auto"
          w="18px"
          h="18px"
          borderRadius="50%"
          border={`2px solid ${colors.coolGrey500}`}
          aria-hidden
        />
      )}

      <Box
        as="button"
        type="button"
        flex="1 1 auto"
        minWidth="0"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="8px"
        p="0"
        background="transparent"
        border="none"
        cursor="pointer"
        onClick={step.onClick}
        id={`e2e-get-started-${step.name}`}
      >
        <Text
          as="span"
          m="0"
          fontSize="s"
          textAlign="left"
          color={step.done ? 'textSecondary' : 'textPrimary'}
        >
          {formatMessage(step.label)}
        </Text>
        <Icon
          name="chevron-right"
          width="16px"
          height="16px"
          fill={colors.textSecondary}
          my="0px"
        />
      </Box>
    </Box>
  );
};

export default StepRow;
