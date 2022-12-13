import React from 'react';

// components
import { Box, Text, colors, Icon } from '@citizenlab/cl2-component-library';

type FieldRuleDisplayProps = {
  answerTitle: string | undefined;
  targetPage: string | undefined;
};

export const FieldRuleDisplay = ({
  answerTitle,
  targetPage,
}: FieldRuleDisplayProps) => {
  if (answerTitle && targetPage) {
    return (
      <Box
        display="flex"
        ml="52px"
        height="24px"
        data-cy="e2e-field-rule-display"
      >
        <Icon fill={colors.coolGrey500} width="18px" name="logic" my="auto" />
        <Text my="auto" pl="8px" pr="4px" color="coolGrey600" fontSize="s">
          {answerTitle}
        </Text>
        <Icon fill={colors.teal300} width="16px" name="arrow-right" my="auto" />
        <Text my="auto" px="4px" color="coolGrey600" fontSize="s">
          {targetPage}
        </Text>
      </Box>
    );
  }
  return null;
};
