import React, { memo, useState, useMemo } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import useIdeaById from 'api/ideas/useIdeaById';
import { isNilOrError } from 'utils/helperUtils';
import { isNil } from 'lodash-es';

// components
import { Icon, Text, colors } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Map, { Point } from 'components/Map';
import {
  Header,
  Item,
} from 'containers/IdeasShow/components/MetaInformation/MetaInfoStyles';

// utils
import { getAddressOrFallbackDMS } from 'utils/map';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// styling
import { isRtl, fontSizes, media } from 'utils/styleUtils';

// typings
import { LatLngTuple } from 'leaflet';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledIcon = styled(Icon)`
  flex: 0 0 24px;
  fill: ${colors.textSecondary};
  margin-right: 8px;

  ${isRtl`
    margin-right: 0;
    margin-left: 8px;
  `}
`;

const OpenMapModalButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  line-height: 22px;
  text-decoration: underline;
  text-align: left;
  margin: 0;
  padding: 0;
  border: none;
  appearance: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.2, colors.textSecondary)};
  }
`;

const Address = styled.div`
  width: calc(100% - 35px);
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const MapContainer = styled.div`
  padding: 30px;

  ${media.phone`
    padding: 20px;
  `}
`;

export interface Props {
  projectId: string;
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const Location = memo<Props>(({ projectId, ideaId, compact, className }) => {
  const { formatMessage } = useIntl();
  const [isOpened, setIsOpened] = useState(false);
  const { data: idea } = useIdeaById(ideaId);

  const point =
    (!isNilOrError(idea) && idea.data.attributes?.location_point_geojson) ||
    null;
  const lat = point?.coordinates?.[1] || null;
  const lng = point?.coordinates?.[0] || null;
  const address = !isNilOrError(idea)
    ? getAddressOrFallbackDMS(
        idea.data.attributes.location_description,
        idea.data.attributes.location_point_geojson
      )
    : null;

  const points = useMemo(() => {
    return point ? ([point] as Point[]) : undefined;
  }, [point]);

  const centerLatLng = useMemo(() => {
    if (!isNil(lat) && !isNil(lng)) {
      return [lat, lng] as LatLngTuple;
    }
    return;
  }, [lat, lng]);

  const closeModal = () => {
    setIsOpened(false);
  };

  const openModal = () => {
    setIsOpened(true);
  };

  if (address) {
    return (
      <Item className={className || ''} compact={compact}>
        <Header>{formatMessage(messages.location)}</Header>
        <Container>
          <StyledIcon name="position" ariaHidden />
          {point && (
            <OpenMapModalButton id="e2e-map-popup" onClick={openModal}>
              {address}
            </OpenMapModalButton>
          )}
          {!point && (
            <Text
              m="0px"
              p="0px"
              id="e2e-address-text-only"
              color="coolGrey600"
              fontSize="s"
            >
              {address}
            </Text>
          )}
        </Container>
        <Modal
          opened={isOpened}
          close={closeModal}
          header={<Address>{address}</Address>}
          width={1150}
        >
          <MapContainer>
            <Map
              projectId={projectId}
              points={points}
              centerLatLng={centerLatLng}
              zoomLevel={15}
            />
          </MapContainer>
        </Modal>
      </Item>
    );
  }

  return null;
});

export default Location;
