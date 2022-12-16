import React from 'react';

// components
import {
  Box,
  Text,
  colors,
  Icon,
  Badge,
} from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

type FieldRuleDisplayProps = {
  answerTitle: string | undefined;
  targetPage: string | undefined;
  isRuleValid: boolean;
};

export const FieldRuleDisplay = ({
  answerTitle,
  targetPage,
  isRuleValid,
}: FieldRuleDisplayProps) => {
  if (answerTitle && targetPage) {
    return (
      <Box
        display="flex"
        ml="52px"
        height="24px"
        data-cy="e2e-field-rule-display"
      >
        <Icon
          fill={isRuleValid ? colors.coolGrey500 : colors.error}
          width="18px"
          name="logic"
          my="auto"
        />
        <Text my="auto" pl="8px" pr="4px" color="coolGrey600" fontSize="s">
          {answerTitle}
        </Text>
        <Icon
          fill={isRuleValid ? colors.teal300 : colors.error}
          width="16px"
          name="arrow-right"
          my="auto"
        />
        <Text my="auto" px="4px" color="coolGrey600" fontSize="s">
          {targetPage}
        </Text>
        {!isRuleValid && (
          <Box my="auto" ml="8px">
            <Badge
              style={{ padding: '2px 4px 2px 4px' }}
              className="inverse"
              color={colors.error}
            >
              <FormattedMessage {...messages.invalidLogicBadgeMessage} />
            </Badge>
          </Box>
        )}
      </Box>
    );
  }
  return null;
};
