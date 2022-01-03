import React, { memo, useState, useMemo } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';
import { isNil } from 'lodash-es';

// components
import { Icon, colors } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import Map, { Point } from 'components/Map';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';

// utils
import { getAddressOrFallbackDMS } from 'utils/map';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
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
  flex: 0 0 16px;
  width: 16px;
  fill: ${colors.label};
  margin-right: 8px;

  ${isRtl`
    margin-right: 0;
    margin-left: 8px;
  `}
`;

const OpenMapModalButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 22px;
  text-decoration: underline;
  text-align: left;
  margin: 0;
  padding: 0;
  border: none;
  appearance: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.2, colors.label)};
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

  ${media.smallerThanMinTablet`
    padding: 20px;
  `}
`;

export interface Props {
  projectId: string;
  ideaId: string;
  compact?: boolean;
  className?: string;
}

const Location = memo<Props & InjectedIntlProps>(
  ({ intl: { formatMessage }, projectId, ideaId, compact, className }) => {
    const [isOpened, setIsOpened] = useState(false);
    const idea = useIdea({ ideaId });

    const point =
      (!isNilOrError(idea) && idea.attributes?.location_point_geojson) || null;
    const lat = point?.coordinates?.[1] || null;
    const lng = point?.coordinates?.[0] || null;
    const address = !isNilOrError(idea)
      ? getAddressOrFallbackDMS(
          idea.attributes.location_description,
          idea.attributes.location_point_geojson
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

    if (address && points) {
      return (
        <Item className={className || ''} compact={compact}>
          <Header>{formatMessage(messages.location)}</Header>
          <Container>
            <StyledIcon name="position" ariaHidden />
            <OpenMapModalButton id="e2e-map-popup" onClick={openModal}>
              {address}
            </OpenMapModalButton>
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
  }
);

export default injectIntl(Location);
