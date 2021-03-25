import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { darken } from 'polished';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon, colors } from 'cl2-component-library';
import ModalWithMap from './ModalWithMap';
import { Header, Item } from './';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

import { isRtl } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledIcon = styled(Icon)`
  width: 15px;
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
      const geoPosition = idea.attributes.location_point_geojson;

      if (address && geoPosition) {
        return (
          <Item>
            <Header>{formatMessage(messages.location)}</Header>
            <Container>
              <StyledIcon name="position" ariaHidden />
              <OpenMapModalButton id="e2e-map-popup" onClick={openModal}>
                {address}
              </OpenMapModalButton>
            </Container>
            <ModalWithMap
              address={address}
              position={geoPosition}
              projectId={projectId}
              isOpened={isOpened}
              onCloseModal={closeModal}
            />
          </Item>
        );
      }
    }

    return null;
  }
);

export default injectIntl(Location);
