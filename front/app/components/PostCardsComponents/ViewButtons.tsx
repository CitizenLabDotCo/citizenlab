import React, { memo, FormEvent } from 'react';
import { trackEventByName } from 'utils/analytics';

// components
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
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

const ListButton = styled(Button)``;

const MapButton = styled(Button)`
  margin-left: 4px;
`;

interface Props {
  className?: string;
  selectedView: 'card' | 'map';
  onClick: (selectedView: 'card' | 'map') => void;
}

const ViewButtons = memo<Props>(({ className, selectedView, onClick }) => {
  const isListViewSelected = selectedView === 'card';
  const isMapViewSelected = selectedView === 'map';

  const handleOnClick =
    (selectedView: 'card' | 'map') => (event: FormEvent) => {
      event.preventDefault();
      onClick(selectedView);
      trackEventByName(tracks.toggleDisplay, {
        locationButtonWasClicked: location.pathname,
        selectedDisplayMode: selectedView,
      });
    };

  return (
    <Container
      className={`e2e-list-map-viewbuttons ${className || ''}`}
      role="tablist"
    >
      <ListButton
        buttonStyle="white"
        icon="list2"
        role="tab"
        aria-selected={isListViewSelected}
        tabIndex={isListViewSelected ? 0 : -1}
        id="view-tab-1"
        aria-controls="view-panel-1"
        onClick={handleOnClick('card')}
        padding="7px 12px"
        textColor={colors.text}
        bgColor={!isListViewSelected ? 'transparent' : undefined}
        bgHoverColor={!isListViewSelected ? 'rgba(0,0,0,0.12)' : undefined}
        boxShadowHover={!isListViewSelected ? 'none' : undefined}
        fullWidth={true}
      >
        <FormattedMessage {...messages.list} />
      </ListButton>
      <MapButton
        buttonStyle="white"
        icon="map"
        role="tab"
        aria-selected={isMapViewSelected}
        tabIndex={isMapViewSelected ? 0 : -1}
        id="view-tab-2"
        aria-controls="view-panel-2"
        onClick={handleOnClick('map')}
        padding="7px 12px"
        textColor={colors.text}
        bgColor={!isMapViewSelected ? 'transparent' : undefined}
        bgHoverColor={!isMapViewSelected ? 'rgba(0,0,0,0.12)' : undefined}
        boxShadowHover={!isMapViewSelected ? 'none' : undefined}
        fullWidth={true}
      >
        <FormattedMessage {...messages.map} />
      </MapButton>
    </Container>
  );
});

export default ViewButtons;
