import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import workshopsImage from './workshop.png'; // Avoid plural 'workshops' as our Workshops server will intervene and re-route the image path, breaking the link.

export const Workshops = () => {
  const { formatMessage } = useIntl();

  return (
    <Box background={colors.white} display="flex" p="20px">
      <Box w="320px" h="240px" borderRadius="3px">
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
          <ButtonWithLink
            height="45px"
            icon="arrow-right"
            iconColor={colors.white}
            iconPos="right"
            linkTo={`${window.location.origin}/workshops` as RouteType}
            openLinkInNewTab
            textColor="white"
            bgColor={colors.primary}
          >
            {formatMessage(messages.manageWorkshops)}
          </ButtonWithLink>
          <ButtonWithLink
            height="45px"
            buttonStyle="text"
            linkTo={formatMessage(messages.workshopsSupportLink) as RouteType}
            openLinkInNewTab
            textColor={colors.primary}
          >
            {formatMessage(messages.learnMore)}
          </ButtonWithLink>
        </Box>
      </Box>
    </Box>
  );
};

export default Workshops;
