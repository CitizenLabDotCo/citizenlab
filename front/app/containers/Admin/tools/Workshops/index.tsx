import React from 'react';
import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import workshopsImage from './workshops.png';

export const Workshops = () => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Box background={colors.white} display="flex" p="20px">
        <Box w="320px" h="240px">
          <img
            src={workshopsImage}
            alt={formatMessage(messages.workshopsImage)}
          />
        </Box>

        <Box ml="32px" display="flex" flexDirection="column">
          <Text variant="bodyL" color="primary" my="0px">
            {formatMessage(messages.workshopsTitle)}
          </Text>
          <Text color="coolGrey700">
            {formatMessage(messages.workshopsDescription)}
          </Text>
          <Box display="flex" width="100%" alignItems="center">
            <Button
              height="45px"
              icon="arrow-right"
              iconColor={colors.white}
              iconPos="right"
              linkTo={`${window.location.origin}/workshops`}
              openLinkInNewTab
            >
              <Text color="white">
                {formatMessage(messages.manageWorkshops)}
              </Text>
            </Button>
            <Button
              height="45px"
              buttonStyle="text"
              linkTo={formatMessage(messages.workshopsSupportLink)}
              openLinkInNewTab
            >
              <Text color="primary">{formatMessage(messages.learnMore)}</Text>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Workshops;
