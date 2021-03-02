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

  const handleOnClick = (selectedView: 'card' | 'map') => (
    event: FormEvent
  ) => {
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
        onClick={handleOnClick('card')}
        padding="7px 12px"
        textColor={colors.text}
        textDecorationHover={!isListViewSelected ? 'underline' : undefined}
        bgColor={!isListViewSelected ? 'transparent' : undefined}
        bgHoverColor={!isListViewSelected ? 'transparent' : undefined}
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
        onClick={handleOnClick('map')}
        padding="7px 12px"
        textColor={colors.text}
        textDecorationHover={!isMapViewSelected ? 'underline' : undefined}
        bgColor={!isMapViewSelected ? 'transparent' : undefined}
        bgHoverColor={!isMapViewSelected ? 'transparent' : undefined}
        boxShadowHover={!isMapViewSelected ? 'none' : undefined}
        fullWidth={true}
      >
        <FormattedMessage {...messages.map} />
      </MapButton>
    </Container>
  );
});

export default ViewButtons;
