import React, { memo, FormEvent, useRef, KeyboardEvent } from 'react';
import { trackEventByName } from 'utils/analytics';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Button, defaultStyles } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracks
import tracks from './tracks';

import useLocale from 'hooks/useLocale';

const Container = styled.div`
  display: flex;
  padding: 4px;
  background: ${darken(0.06, colors.lightGreyishBlue)};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const ViewButton = styled.button`
  padding: 7px 12px;
  background-color: #fff;
  color: ${colors.text};
  border-color: transparent;
  box-shadow: ${defaultStyles.boxShadow};
`;

const ListButton = styled(ViewButton)``;

const MapButton = styled(ViewButton)`
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
  const listButtonRef = useRef<HTMLButtonElement | null>(null);
  const mapButtonRef = useRef<HTMLButtonElement | null>(null);
  const locale = useLocale();

  const handleOnClick =
    (selectedView: 'card' | 'map') => (event: FormEvent) => {
      event.preventDefault();
      onClick(selectedView);
      trackEventByName(tracks.toggleDisplay, {
        locationButtonWasClicked: location.pathname,
        selectedDisplayMode: selectedView,
      });
    };

  const handleTabListOnKeyDown = (e: KeyboardEvent) => {
    const arrowLeftPressed = e.key === 'ArrowLeft';
    const arrowRightPressed = e.key === 'ArrowRight';

    console.log(listButtonRef.current);
    console.log(mapButtonRef.current);

    if (arrowLeftPressed || arrowRightPressed) {
      onClick(selectedView === 'card' ? 'map' : 'card');
      selectedView === 'map'
        ? listButtonRef.current?.focus()
        : mapButtonRef.current?.focus();
    }
  };

  if (!isNilOrError(locale)) {
    return (
      <Container
        className={`e2e-list-map-viewbuttons ${className || ''}`}
        role="tablist"
      >
        <ListButton
          className={className}
          // buttonStyle="white"
          // icon="list2"
          role="tab"
          aria-selected={isListViewSelected}
          tabIndex={isListViewSelected ? 0 : -1}
          id="view-tab-1"
          aria-controls="view-panel-1"
          onClick={handleOnClick('card')}
          // padding="7px 12px"
          // textColor={colors.text}
          // bgColor={!isListViewSelected ? 'transparent' : undefined}
          // bgHoverColor={!isListViewSelected ? 'rgba(0,0,0,0.12)' : undefined}
          // boxShadowHover={!isListViewSelected ? 'none' : undefined}
          // fullWidth={true}
          ref={(el) => (listButtonRef.current = el)}
          onKeyDown={handleTabListOnKeyDown}
          // locale={locale}
        >
          <FormattedMessage {...messages.list} />
        </ListButton>
        <MapButton
          className={className}
          // buttonStyle="white"
          // icon="map"
          role="tab"
          aria-selected={isMapViewSelected}
          tabIndex={isMapViewSelected ? 0 : -1}
          id="view-tab-2"
          aria-controls="view-panel-2"
          onClick={handleOnClick('map')}
          // padding="7px 12px"
          // textColor={colors.text}
          // bgColor={!isMapViewSelected ? 'transparent' : undefined}
          // bgHoverColor={!isMapViewSelected ? 'rgba(0,0,0,0.12)' : undefined}
          // boxShadowHover={!isMapViewSelected ? 'none' : undefined}
          // fullWidth={true}
          ref={(el) => (mapButtonRef.current = el)}
          onKeyDown={handleTabListOnKeyDown}
          // locale={locale}
        >
          <FormattedMessage {...messages.map} />
        </MapButton>
      </Container>
    );
  }

  return null;
});

export default ViewButtons;
