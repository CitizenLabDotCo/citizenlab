import React from 'react';

import {
  Box,
  Text,
  colors,
  Icon,
  Badge,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

// Intl
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

interface Props {
  targetPage: string | undefined;
  isRuleValid: boolean;
  isDefaultPage: boolean;
}

export const PageRuleDisplay = ({
  targetPage,
  isRuleValid,
  isDefaultPage,
}: Props) => {
  if (!targetPage) return null;

  return (
    <Box
      display="flex"
      ml="52px"
      height="24px"
      data-cy="e2e-field-rule-display"
    >
      <Icon
        fill={
          isRuleValid
            ? isDefaultPage
              ? colors.coolGrey300
              : colors.coolGrey500
            : colors.error
        }
        width="18px"
        name="logic"
        my="auto"
      />
      <Text
        my="auto"
        pl="8px"
        pr="4px"
        color={isDefaultPage ? 'coolGrey500' : 'blue500'}
        fontSize="s"
        fontStyle={isDefaultPage ? 'italic' : 'normal'}
      >
        <FormattedMessage {...messages.nextPageLabel} />
      </Text>
      <Text
        my="auto"
        px="4px"
        color={isDefaultPage ? 'coolGrey500' : 'blue500'}
        fontSize="s"
        fontWeight={isDefaultPage ? 'normal' : 'bold'}
        fontStyle={isDefaultPage ? 'italic' : 'normal'}
      >
        {targetPage}
      </Text>
      {isDefaultPage && (
        <IconTooltip
          iconColor={colors.coolGrey300}
          content={<FormattedMessage {...messages.pageRuleTooltip} />}
        />
      )}
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
