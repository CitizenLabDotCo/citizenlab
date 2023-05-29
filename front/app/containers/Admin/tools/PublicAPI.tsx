import React from 'react';
import { Box, Text, Badge, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import apiImage from './apIllustration.png';

export const PublicAPI = () => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Box background={colors.white} display="flex" p="20px">
        <Box w="320px" h="240px">
          <img src={apiImage} alt={formatMessage(messages.publicAPIImage)} />
        </Box>
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
            <Text color="white">
              {formatMessage(messages.managePublicAPIKeys)}
            </Text>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PublicAPI;
