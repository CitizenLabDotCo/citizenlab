import React from 'react';

import { Box, Icon, Text, bo, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  title: string;
}

const AdminOnlyPlaceholder = ({ title }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap="6px"
      p="16px"
      border={`1px dashed ${colors.divider}`}
      borderRadius={bo.borderRadius}
      background={colors.grey50}
    >
      <Text
        variant="boSection"
        m="0"
        lineHeight="18px"
        color="coolGrey700"
        textAlign="center"
      >
        {title}
      </Text>
      <Box display="flex" alignItems="center" gap="6px">
        <Icon
          name="eye-off"
          width="14px"
          height="14px"
          fill={colors.coolGrey500}
          ariaHidden
        />
        <Text m="0" fontSize="xs" lineHeight="14px" color="coolGrey500">
          {formatMessage(messages.onlyAdminsSeeThis)}
        </Text>
      </Box>
    </Box>
  );
};

export default AdminOnlyPlaceholder;
