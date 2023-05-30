import React from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import widgetImage from './widget.png';

export const Widget = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      background={colors.white}
      display="flex"
      p="20px"
      my="20px"
      width="100%"
    >
      <Box
        px="40px"
        w="320px"
        h="240px"
        background={colors.teal500}
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
          linkTo="/admin/tools/widgets"
          textColor="white"
        >
          {formatMessage(messages.manageWidget)}
        </Button>
      </Box>
    </Box>
  );
};

export default Widget;
