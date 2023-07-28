import React from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import useFeatureFlag from 'hooks/useFeatureFlag';
import apiImage from './api.png';

export const PublicAPI = () => {
  const isPublicAPIEnabled = useFeatureFlag({ name: 'public_api_tokens' });
  const { formatMessage } = useIntl();

  if (!isPublicAPIEnabled) return null;

  return (
    <Box background={colors.white} display="flex" p="20px">
      <img
        width="320px"
        height="240px"
        src={apiImage}
        alt={formatMessage(messages.publicAPIImage)}
      />

      <Box ml="32px" display="flex" flexDirection="column">
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
          linkTo="/admin/tools/public-api-tokens"
        >
          {formatMessage(messages.managePublicAPIKeys)}
        </Button>
      </Box>
    </Box>
  );
};

export default PublicAPI;
