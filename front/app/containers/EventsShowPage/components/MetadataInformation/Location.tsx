import React, { useState } from 'react';

// components
import {
  Box,
  Button,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Map from 'components/Map';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// types
import { IEventData } from 'api/events/types';
import { LatLngTuple } from 'leaflet';

// hooks
import useLocale from 'hooks/useLocale';

// utils
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  event: IEventData | null;
}

const Location = ({ event }: Props) => {
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const currentLocale = useLocale();
  const isMobile = useBreakpoint('phone');
  const projectId = event?.relationships.project.data.id;
  const position = event?.attributes.location_point_geojson;
  const center = position?.coordinates;
  const centerLatLng = center && ([center[1], center[0]] as LatLngTuple);
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
                fontWeight="bold"
                fontSize="m"
                buttonStyle="text"
                onClick={() => {
                  setMapModalVisible(true);
                }}
                pl="0px"
                style={{
                  textDecoration: 'underline',
                  justifyContent: 'left',
                  textAlign: 'left',
                }}
                id="e2e-location-with-coordinates-button"
              >
                <Text
                  fontWeight="bold"
                  mt="4px"
                  color="coolGrey600"
                  m="0px"
                  p="0px"
                  fontSize="s"
                >
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
        </Content>

        <Modal
          opened={mapModalVisible}
          close={() => {
            setMapModalVisible(false);
          }}
          header={
            <Box mt="8px" mb="8px">
              {address1}
            </Box>
          }
          width={900}
        >
          <Box p="12px" id="e2e-event-map-modal">
            {position && projectId && centerLatLng && (
              <Map
                points={[{ ...position, id: 'markerPosition' }]}
                centerLatLng={centerLatLng}
                projectId={projectId}
                mapHeight={isMobile ? '460px' : '600px'}
                noMarkerClustering={false}
                zoomLevel={19}
              />
            )}
          </Box>
        </Modal>
      </Container>
    );
  }

  return null;
};

export default Location;
