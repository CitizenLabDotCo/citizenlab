import React from 'react';

import {
  Box,
  colors,
  IconButton,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

export interface PanelNavigation {
  position: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

interface Props {
  context: string;
  navigation: PanelNavigation | undefined;
}

const PanelHeader = ({ context, navigation }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="12px"
      pl="24px"
      pr="80px"
      py="12px"
      borderBottom={`1px solid ${colors.divider}`}
      position="sticky"
      top="0"
      background={colors.white}
      zIndex="1"
    >
      <Text variant="boHelper" m="0">
        {context}
      </Text>
      {navigation && (
        <Box display="flex" alignItems="center" gap="8px">
          <IconButton
            iconName="chevron-left"
            iconColor={colors.coolGrey600}
            iconColorOnHover={colors.textPrimary}
            a11y_buttonActionMessage={formatMessage(messages.previousInput)}
            onClick={() => navigation.onPrevious?.()}
            disabled={!navigation.onPrevious}
          />
          <Text variant="boHelper" m="0">
            {formatMessage(messages.position, {
              position: navigation.position,
              total: navigation.total,
            })}
          </Text>
          <IconButton
            iconName="chevron-right"
            iconColor={colors.coolGrey600}
            iconColorOnHover={colors.textPrimary}
            a11y_buttonActionMessage={formatMessage(messages.nextInput)}
            onClick={() => navigation.onNext?.()}
            disabled={!navigation.onNext}
          />
        </Box>
      )}
    </Box>
  );
};

export default PanelHeader;
