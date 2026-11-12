import React from 'react';

import {
  Box,
  Icon,
  IconButton,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  titleId: string;
  onClose: () => void;
};

const ChatHeader = ({ titleId, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap="8px"
      px="20px"
      py="14px"
      borderBottom={`1px solid ${colors.grey200}`}
    >
      <Box display="flex" alignItems="center" gap="8px" flexShrink={0}>
        <Icon name="stars" fill={colors.teal400} />
        <Title variant="h5" as="h2" m="0px" id={titleId}>
          {formatMessage(messages.title)}
        </Title>
        <Box px="8px" py="2px" borderRadius="999px" bgColor={colors.grey100}>
          <Text as="span" m="0px" fontSize="xs" color="textSecondary">
            {formatMessage(messages.beta)}
          </Text>
        </Box>
      </Box>
      <IconButton
        iconName="close"
        buttonType="button"
        iconColor={colors.coolGrey600}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={formatMessage(messages.close)}
        onClick={onClose}
      />
    </Box>
  );
};

export default ChatHeader;
