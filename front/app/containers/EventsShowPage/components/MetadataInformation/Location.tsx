import React, { lazy } from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IEventData } from 'api/events/types';

import useLocale from 'hooks/useLocale';

import messages from 'components/EventCards/messages';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { Container, Content, StyledIcon } from './MetadataInformationStyles';

const LocationMap = lazy(() => import('./LocationMap'));

export interface Props {
  event: IEventData | null;
}

const Location = ({ event }: Props) => {
  const { formatMessage } = useIntl();
  const isPhoneOrSmaller = useBreakpoint('phone');
  const currentLocale = useLocale();
  const position = event?.attributes.location_point_geojson;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const address1 = event?.attributes?.address_1;

  if (isNilOrError(currentLocale) || !address1) {
    return null;
  }

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const address2 = event?.attributes?.address_2_multiloc[currentLocale];
  const locationName = address1.slice(0, address1.indexOf(','));

  if (address1) {
    return (
      <Container>
        <StyledIcon
          name="position"
          title={formatMessage(messages.locationIconAltText)}
          ariaHidden={false}
        />
        <Content>
          {position ? (
            <Box display="flex">
              <ButtonWithLink
                m="0px"
                p="0px"
                fontSize="m"
                buttonStyle="text"
                linkTo={`https://www.google.com/maps/search/?api=1&query=${position.coordinates[1]},${position.coordinates[0]}`}
                openLinkInNewTab={isPhoneOrSmaller ? false : true} // On mobile, this will open the app instead
                ariaLabel={formatMessage(messages.viewLocationOnGoogleMaps, {
                  location: locationName,
                })}
                pl="0px"
                style={{
                  textDecoration: 'underline',
                  justifyContent: 'left',
                  textAlign: 'left',
                }}
                id="e2e-location-with-coordinates-button"
              >
                <Text mt="4px" color="coolGrey600" m="0px" p="0px" fontSize="s">
                  {locationName}
                </Text>
              </ButtonWithLink>
            </Box>
          ) : (
            <Text
              id="e2e-text-only-location"
              my="4px"
              color="coolGrey600"
              fontSize="s"
            >
              {address1}
            </Text>
          )}
          {address2 && (
            <Text
              id="e2e-text-only-location"
              my="4px"
              color="coolGrey600"
              fontSize="s"
            >
              {address2}
            </Text>
          )}

          {position &&
            !isPhoneOrSmaller && ( // Negative margin extends the map outside the container
              <Box ml="-30px" width="300" mt="8px" id="e2e-location-map">
                <LocationMap eventLocation={position} />
              </Box>
            )}
        </Content>
      </Container>
    );
  }

  return null;
};

export default Location;
