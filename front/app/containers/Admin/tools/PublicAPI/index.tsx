import React from 'react';
import { Box, Text, Badge, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

export const PublicAPI = () => {
  const { formatMessage } = useIntl();

  return (
    <Box background={colors.white} display="flex" p="20px">
      <Box w="415px" h="240px" background={colors.grey200} />
      <Box ml="32px" display="flex" flexDirection="column">
        <Box width="fit-content" mb="10px">
          <Badge className="inverse" color={colors.coolGrey300}>
            {formatMessage(messages.comingSoon)}
          </Badge>
        </Box>
        <Text variant="bodyL" color="primary" my="0px">
          {formatMessage(messages.publicAPITitle)}
        </Text>
        <Text color="coolGrey700">
          {formatMessage(messages.publicAPIDescription)}
        </Text>
        <Button
          height="45px"
          icon="arrow-right"
          iconColor={colors.white}
          iconPos="right"
          width="fit-content"
          disabled
        >
          {formatMessage(messages.managePublicAPIKeys)}
        </Button>
      </Box>
    </Box>
  );
};

export default PublicAPI;
