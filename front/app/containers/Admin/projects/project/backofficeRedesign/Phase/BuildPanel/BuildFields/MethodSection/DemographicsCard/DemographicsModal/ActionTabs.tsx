import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import { useIntl } from 'utils/cl-intl';

import actionLabel from './actionLabel';

interface Props {
  actions: IPhasePermissionAction[];
  selected: IPhasePermissionAction;
  onSelect: (action: IPhasePermissionAction) => void;
}

const ActionTabs = ({ actions, selected, onSelect }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      role="tablist"
      display="inline-flex"
      flexWrap="wrap"
      gap="2px"
      p="3px"
      // A pill, so the radius is a shape rather than the card radius.
      borderRadius="999px"
      background={colors.grey100}
    >
      {actions.map((action) => {
        const active = action === selected;

        return (
          <Box
            key={action}
            as="button"
            type="button"
            role="tab"
            aria-selected={active}
            px="14px"
            py="5px"
            border="none"
            borderRadius="999px"
            background={active ? colors.white : 'transparent'}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(action)}
          >
            <Text
              as="span"
              variant="boControl"
              fontWeight="semi-bold"
              color={active ? 'textPrimary' : 'coolGrey600'}
              m="0"
            >
              {formatMessage(actionLabel(action))}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default ActionTabs;
