import React from 'react';

import {
  Box,
  Text,
  colors,
  Icon,
  Badge,
} from '@citizenlab/cl2-component-library';

// Intl
import { ICustomFieldSettingsTab } from 'api/custom_fields/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

interface Props {
  answerTitle: string | undefined;
  targetPage: string | undefined;
  isRuleValid: boolean;
  handleOpenSettings: (defaultTab: ICustomFieldSettingsTab) => void;
}

export const QuestionRuleDisplay = ({
  answerTitle,
  targetPage,
  isRuleValid,
  handleOpenSettings,
}: Props) => {
  if (!(answerTitle && targetPage)) {
    return null;
  }

  const answer =
    answerTitle.length > 60 ? `${answerTitle.slice(0, 60)}...` : answerTitle;

  return (
    <Box
      display="flex"
      data-cy="e2e-field-rule-display"
      ml="68px"
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      mb="4px"
    >
      <Box flex="3">
        <Text my="auto" color="coolGrey600" fontSize="s">
          {answer}
        </Text>
      </Box>
      <Box px="4px">
        <Icon
          fill={isRuleValid ? colors.teal300 : colors.error}
          width="16px"
          name="arrow-right"
          my="auto"
        />
      </Box>
      <Box flex="3">
        <Text
          my="auto"
          color="coolGrey600"
          fontSize="s"
          display="inline"
          textDecoration="underline"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenSettings('logic');
          }}
        >
          {targetPage}
        </Text>

        {!isRuleValid && (
          <Box my="auto" ml="12px" display="inline">
            <Badge
              style={{ padding: '2px 6px' }}
              className="inverse"
              color={colors.error}
            >
              <FormattedMessage {...messages.invalidLogicBadgeMessage} />
            </Badge>
          </Box>
        )}
      </Box>
    </Box>
  );
};
