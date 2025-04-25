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
  targetPage: string | undefined;
  isRuleValid: boolean;
  isDefaultPage: boolean;
  handleOpenSettings: (defaultTab: ICustomFieldSettingsTab) => void;
}

export const PageRuleDisplay = ({
  targetPage,
  isRuleValid,
  isDefaultPage,
  handleOpenSettings,
}: Props) => {
  if (!targetPage) return null;

  return (
    <Box
      display="flex"
      ml="44px"
      height="24px"
      data-cy="e2e-field-rule-display"
    >
      <Icon
        fill={
          isRuleValid
            ? isDefaultPage
              ? colors.coolGrey300
              : colors.teal300
            : colors.error
        }
        width="18px"
        name="arrow-right"
        my="auto"
      />
      <Text
        my="auto"
        pl="8px"
        color={isDefaultPage ? 'coolGrey500' : 'blue500'}
        fontSize="s"
        fontStyle={isDefaultPage ? 'italic' : 'normal'}
      >
        <FormattedMessage {...messages.continuePageLabel} />
      </Text>
      <Text
        my="auto"
        px="4px"
        color={isDefaultPage ? 'coolGrey500' : 'blue500'}
        fontSize="s"
        fontWeight={isDefaultPage ? 'normal' : 'bold'}
        fontStyle={isDefaultPage ? 'italic' : 'normal'}
        textDecoration="underline"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenSettings('logic');
        }}
      >
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
