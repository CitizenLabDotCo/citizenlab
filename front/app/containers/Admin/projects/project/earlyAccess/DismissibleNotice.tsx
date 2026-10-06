import React, { ReactNode } from 'react';

import {
  Box,
  colors,
  Icon,
  IconButton,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import useDismissed from './useDismissed';

type Props = {
  storageKey: string;
  children: ReactNode;
};

const DismissibleNotice = ({ storageKey, children }: Props) => {
  const { formatMessage } = useIntl();
  const { dismissed, dismiss } = useDismissed(storageKey);

  if (dismissed) return null;

  return (
    <Box
      display="flex"
      alignItems="flex-start"
      gap="10px"
      p="14px"
      bgColor={colors.teal100}
      borderRadius={stylingConsts.borderRadius}
    >
      <Box flex="0 0 24px" display="flex">
        <Icon name="info-outline" fill={colors.teal700} />
      </Box>
      <Box flexGrow={1}>
        <Text m="0px" color="teal700" fontSize="s">
          {children}
        </Text>
      </Box>
      <IconButton
        iconName="close"
        iconColor={colors.teal700}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={formatMessage(messages.dismiss)}
        onClick={dismiss}
      />
    </Box>
  );
};

export default DismissibleNotice;
