import React, { useState } from 'react';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Map from 'components/Map';

// styling
import { Container, Content, StyledIcon } from './MetadataInformationStyles';

// types
import { IEventData } from 'api/events/types';
import { LatLngTuple } from 'leaflet';

export interface Props {
  location?: string | null;
  event: IEventData | null;
}

const Location = ({ location, event }: Props) => {
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const projectId = event?.relationships.project.data.id;
  const position = event?.attributes.location_point_geojson;
  const center = position?.coordinates;
  const centerLatLng = center && ([center[1], center[0]] as LatLngTuple);

  if (location) {
    return (
      <Container>
        <StyledIcon name="position" ariaHidden />
        <Content>
          {/* <Text color="coolGrey600" fontSize="s">
            {location}
          </Text> */}
          <Button
            fontSize="s"
            buttonStyle="text"
            onClick={() => {
              setMapModalVisible(true);
            }}
            pl="0px"
            pt="12px"
            style={{ justifyContent: 'left' }}
          >
            <span style={{ textDecoration: 'underline' }}>{location}</span>
          </Button>
        </Content>

        <Modal
          opened={mapModalVisible}
          close={() => {
            setMapModalVisible(false);
          }}
          header={
            <Box mt="8px" mb="8px">
              {location}
            </Box>
          }
          width={900}
        >
          <Box p="12px">
            {position && projectId && centerLatLng && (
              <Map
                points={[{ ...position, id: 'markerPosition' }]}
                centerLatLng={centerLatLng}
                projectId={projectId}
                mapHeight="600px"
                noMarkerClustering={false}
                zoomLevel={20}
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
