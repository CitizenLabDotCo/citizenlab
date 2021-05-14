import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, colors } from 'cl2-component-library';
import Modal from 'components/UI/Modal';
import Map, { Point } from 'components/Map';
import { Header, Item } from 'components/IdeasShowComponents/MetaInfoStyles';

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
  height: 21px;
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
  line-height: 21px;
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
  className?: string;
  projectId: string;
  ideaId: string;
}

const Location = memo<Props & InjectedIntlProps>(
  ({ intl: { formatMessage }, projectId, ideaId }) => {
    const [isOpened, setIsOpened] = useState(false);
    const idea = useIdea({ ideaId });

    const closeModal = () => {
      setIsOpened(false);
    };

    const openModal = () => {
      setIsOpened(true);
    };

    if (!isNilOrError(idea)) {
      const address = idea.attributes.location_description;
      const point = idea.attributes.location_point_geojson;

      if (address && point) {
        const points = [point as Point];
        const centerLatLng = [
          point.coordinates[1],
          point.coordinates[0],
        ] as LatLngTuple;

        return (
          <Item>
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
    }

    return null;
  }
);

export default injectIntl(Location);
