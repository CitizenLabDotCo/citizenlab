import React from 'react';

// components
import {
  Box,
  Text,
  colors,
  Icon,
  Badge,
} from '@citizenlab/cl2-component-library';

// Intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';

interface Props {
  targetPage: string | undefined;
  isRuleValid: boolean;
}

export const PageRuleDisplay = ({ targetPage, isRuleValid }: Props) => {
  if (!targetPage) return null;

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
      <Text my="auto" pl="8px" pr="4px" color="blue500" fontSize="s">
        <FormattedMessage {...messages.nextPageLabel} />
      </Text>
      <Text my="auto" px="4px" color="blue500" fontSize="s" fontWeight="bold">
        {targetPage}
      </Text>
      {!isRuleValid && (
        <Box my="auto" ml="8px">
          <Badge
            style={{ padding: '2px 6px 2px 6px' }}
            className="inverse"
            color={colors.error}
          >
            <FormattedMessage {...messages.invalidLogicBadgeMessage} />
          </Badge>
        </Box>
      )}
    </Box>
  );
};
