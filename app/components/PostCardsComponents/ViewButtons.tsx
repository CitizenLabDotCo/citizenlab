import React, { memo, useCallback } from 'react';
import { trackEventByName } from 'utils/analytics';

// styling
import styled from 'styled-components';
import { rgba } from 'polished';
import { media, fontSizes } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracks
import tracks from './tracks';

const Container = styled.div`
  display: flex;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  padding: 0;
  margin: 0;
  border-radius: 0;
  border: solid 1px ${({ theme }) => theme.colorText};
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  &:not(.active):hover {
    background: ${({ theme }) => rgba(theme.colorText, 0.08)};
  }

  &.active {
    background: ${({ theme }) => theme.colorText};

    > span {
      color: #fff;
    }
  }

  > span {
    color: ${({ theme }) => theme.colorText};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: normal;
    padding-left: 18px;
    padding-right: 18px;
    padding-top: 10px;
    padding-bottom: 10px;

    ${media.smallerThanMinTablet`
      padding-top: 8px;
      padding-bottom: 8px;
    `}
  }
`;

const ListButton = styled(ViewButton)`
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: ${(props: any) => props.theme.borderRadius};
  border-right: none;
`;

const MapButton = styled(ViewButton)`
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-right-radius: ${(props: any) => props.theme.borderRadius};
`;

interface Props {
  className?: string;
  selectedView: 'card' | 'map';
  onClick: (selectedView: 'card' | 'map') => void;
}

const ViewButtons = memo<Props>(
  ({ className, selectedView, onClick }: Props) => {
    const showListView = selectedView === 'card';
    const showMapView = selectedView === 'map';

    const handleOnClick = (selectedView: 'card' | 'map') => (
      event: React.FormEvent
    ) => {
      event.preventDefault();
      onClick(selectedView);
      trackEventByName(tracks.toggleDisplay, {
        locationButtonWasClicked: location.pathname,
        selectedDisplayMode: selectedView,
      });
    };

    const removeFocus = useCallback((event: React.MouseEvent) => {
      event.preventDefault();
    }, []);

    return (
      <Container
        className={`e2e-list-map-viewbuttons ${className}`}
        role="tablist"
      >
        <ListButton
          role="tab"
          aria-selected={showListView}
          onMouseDown={removeFocus}
          onClick={handleOnClick('card')}
          className={`${showListView && 'active'}`}
        >
          <FormattedMessage {...messages.list} />
        </ListButton>
        <MapButton
          role="tab"
          aria-selected={showMapView}
          onMouseDown={removeFocus}
          onClick={handleOnClick('map')}
          className={`${showMapView && 'active'}`}
        >
          <FormattedMessage {...messages.map} />
        </MapButton>
      </Container>
    );
  }
);

export default ViewButtons;
