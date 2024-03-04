import React, { lazy } from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
const LocationMap = lazy(() => import('./LocationMap'));

import { Container, Content, StyledIcon } from './MetadataInformationStyles';

import { IEventData } from 'api/events/types';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  event: IEventData | null;
}

const Location = ({ event }: Props) => {
  const isPhoneOrSmaller = useBreakpoint('phone');
  const currentLocale = useLocale();
  const position = event?.attributes.location_point_geojson;
  const address1 = event?.attributes?.address_1;

  if (isNilOrError(currentLocale) || !address1) {
    return null;
  }

  const address2 = event?.attributes?.address_2_multiloc[currentLocale];

  if (address1) {
    return (
      <Container>
        <StyledIcon name="position" ariaHidden />
        <Content>
          {position ? (
            <Box display="flex">
              <Button
                m="0px"
                p="0px"
                fontSize="m"
                buttonStyle="text"
                linkTo={`https://www.google.com/maps/search/?api=1&query=${position.coordinates[1]},${position.coordinates[0]}`}
                openLinkInNewTab={isPhoneOrSmaller ? false : true} // On mobile, this will open the app instead
                pl="0px"
                style={{
                  textDecoration: 'underline',
                  justifyContent: 'left',
                  textAlign: 'left',
                }}
                id="e2e-location-with-coordinates-button"
              >
                <Text mt="4px" color="coolGrey600" m="0px" p="0px" fontSize="s">
                  {address1.slice(0, address1.indexOf(','))}
                </Text>
              </Button>
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
          {position && ( // Using a negative margin here so we can extend the map outside of the container
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
