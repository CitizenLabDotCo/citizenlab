import React, { memo, useCallback } from 'react';
import { trackEventByName } from 'utils/analytics';

// styling
import styled from 'styled-components';
import { media, fontSizes, colors, defaultStyles } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracks
import tracks from './tracks';

const Container = styled.div`
  display: flex;
  padding: 4px;
  background: ${darken(0.06, colors.lightGreyishBlue)};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  padding: 0;
  margin: 0;
  border-radius: ${(props: any) => props.theme.borderRadius};
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  transition: all 100ms ease-out;

  &.active {
    background: #fff;
    box-shadow: ${defaultStyles.boxShadow};
  }

  &:not(.active):hover {
    text-decoration: underline;
  }

  > span {
    color: ${colors.text};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: normal;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 9px;
    padding-bottom: 9px;

    ${media.smallerThanMinTablet`
      padding: 10px;
    `}
  }

  ${media.smallerThanMinTablet`
    flex: 1;
  `}
`;

const ListButton = styled(ViewButton)`
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: ${(props: any) => props.theme.borderRadius};
  border-right: none;
`;

const MapButton = styled(ViewButton)`
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-right-radius: ${(props: any) => props.theme.borderRadius};
  margin-left: 4px;
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
          className={`${showListView ? 'active' : ''}`}
        >
          <FormattedMessage {...messages.list} />
        </ListButton>
        <MapButton
          role="tab"
          aria-selected={showMapView}
          onMouseDown={removeFocus}
          onClick={handleOnClick('map')}
          className={`${showMapView ? 'active' : ''}`}
        >
          <FormattedMessage {...messages.map} />
        </MapButton>
      </Container>
    );
  }
);

export default ViewButtons;
