import React from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import widgetImage from './widget.png';

export const Widget = () => {
  const { formatMessage } = useIntl();

  return (
    <Box my="20px" width="100%">
      <Box background={colors.white} display="flex" p="20px">
        <Box
          px="40px"
          w="320px"
          h="240px"
          background="#7FBBCA"
          display="flex"
          alignItems="flex-end"
          justifyContent="center"
        >
          <img src={widgetImage} alt={formatMessage(messages.widgetImage)} />
        </Box>
        <Box ml="32px" display="flex" flexDirection="column">
          <Text variant="bodyL" color="primary" my="0px">
            {formatMessage(messages.widgetTitle)}
          </Text>
          <Text color="coolGrey700">
            {formatMessage(messages.widgetDescription)}
          </Text>
          <Button
            height="45px"
            icon="arrow-right"
            iconColor={colors.white}
            iconPos="right"
            width="fit-content"
          >
            <Text color="white">{formatMessage(messages.manageWidget)}</Text>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Widget;
