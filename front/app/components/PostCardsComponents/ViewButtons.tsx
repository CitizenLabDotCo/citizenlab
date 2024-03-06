import React, {
  memo,
  FormEvent,
  useRef,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react';

import {
  Icon,
  defaultStyles,
  fontSizes,
  colors,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import tracks from './tracks';

const Container = styled.div`
  display: flex;
  padding: 4px;
  background: ${darken(0.06, colors.grey200)};
  border-radius: ${(props) => props.theme.borderRadius};
`;

const StyledIcon = styled(Icon)`
  color: ${colors.textSecondary};
  margin-right: 10px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 10px 12px;
  font-size: ${fontSizes.base}px;
  border-radius: 3px;
  background-color: ${(props) => (props.active ? '#fff' : 'transparent')};
  color: ${colors.textSecondary};
  border-color: transparent;
  box-shadow: ${defaultStyles.boxShadow};
  margin-right: 0;
  display: flex;
  align-items: center;

  &:hover {
    background-color: ${(props) =>
      props.active ? '#fff' : 'rgba(0,0,0,0.12)'};
    color: ${darken(0.2, colors.textSecondary)};

    ${StyledIcon} {
      color: ${darken(0.2, colors.textSecondary)};
    }
  }
`;

const ListButton = styled(ViewButton)`
  margin-right: 4px;
`;

const MapButton = styled(ViewButton)``;

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
  const [viewChanged, setViewChanged] = useState<boolean | null>(null);
  const locale = useLocale();

  useEffect(() => {
    if (viewChanged) {
      selectedView === 'map'
        ? mapButtonRef.current?.focus()
        : listButtonRef.current?.focus();
    }
  }, [selectedView, viewChanged]);

  const handleOnClick =
    (selectedView: 'card' | 'map') => (event: FormEvent) => {
      setViewChanged(true);
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

    if (arrowLeftPressed || arrowRightPressed) {
      setViewChanged(true);
      onClick(selectedView === 'card' ? 'map' : 'card');
    }
  };

  if (!isNilOrError(locale)) {
    return (
      <Container
        className={`e2e-list-map-viewbuttons ${className || ''}`}
        role="tablist"
      >
        <ListButton
          role="tab"
          aria-selected={isListViewSelected}
          tabIndex={isListViewSelected ? 0 : -1}
          id="view-tab-1"
          aria-controls="view-panel-1"
          onClick={handleOnClick('card')}
          ref={(el) => (listButtonRef.current = el)}
          onKeyDown={handleTabListOnKeyDown}
          active={isListViewSelected}
        >
          <StyledIcon name="menu" />
          <FormattedMessage {...messages.list} />
        </ListButton>
        <MapButton
          role="tab"
          aria-selected={isMapViewSelected}
          tabIndex={isMapViewSelected ? 0 : -1}
          id="view-tab-2"
          aria-controls="view-panel-2"
          onClick={handleOnClick('map')}
          ref={(el) => (mapButtonRef.current = el)}
          onKeyDown={handleTabListOnKeyDown}
          active={isMapViewSelected}
        >
          <StyledIcon name="map" />
          <FormattedMessage {...messages.map} />
        </MapButton>
      </Container>
    );
  }

  return null;
});

export default ViewButtons;
