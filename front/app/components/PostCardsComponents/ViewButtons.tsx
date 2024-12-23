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
  Box,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled, { useTheme } from 'styled-components';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import tracks from './tracks';

const StyledIcon = styled(Icon)`
  color: ${colors.textSecondary};
  margin-right: 10px;
`;

const ViewButton = styled.button<{ active: boolean }>`
  padding: 4px 8px;
  font-size: ${fontSizes.base}px;
  border-radius: 3px;
  border-color: transparent;
  box-shadow: ${defaultStyles.boxShadow};
  margin-right: 0;
  display: flex;
  align-items: center;
  ${({ active, theme }) =>
    active
      ? {
          backgroundColor: theme.colors.tenantSecondary,
          color: colors.white,
        }
      : {
          backgroundColor: 'transparent',
          color: theme.colors.tenantText,
        }};

  ${StyledIcon} {
    ${({ active, theme }) =>
      active
        ? {
            fill: colors.white,
          }
        : {
            fill: darken(0.2, theme.colors.tenantText),
          }};
  }

  &:hover {
    ${({ active, theme }) =>
      active
        ? {
            backgroundColor: darken(0.15, theme.colors.tenantSecondary),
            color: colors.white,
          }
        : {
            backgroundColor: 'rgba(132, 147, 158, 0.15)',
            color: darken(0.2, theme.colors.tenantText),
          }};
  }
`;

interface Props {
  className?: string;
  selectedView: 'card' | 'map';
  onClick: (selectedView: 'card' | 'map') => void;
}

const ViewButtons = memo<Props>(({ className, selectedView, onClick }) => {
  const theme = useTheme();
  const isListViewSelected = selectedView === 'card';
  const isMapViewSelected = selectedView === 'map';
  const listButtonRef = useRef<HTMLButtonElement | null>(null);
  const mapButtonRef = useRef<HTMLButtonElement | null>(null);

  const [viewChanged, setViewChanged] = useState<boolean | null>(null);

  useEffect(() => {
    // We only want to update this focus if the user clicks/selects the tabs.
    // Otherwise we end up setting focus when the page loads (which leads an
    // issue where the user is incorrectly scrolled down to the idea section on page load).
    if (viewChanged) {
      selectedView === 'map'
        ? mapButtonRef.current?.focus()
        : listButtonRef.current?.focus();
    }
  }, [selectedView, viewChanged]);

  const handleOnClick =
    (selectedView: 'card' | 'map') => (event: FormEvent) => {
      event.preventDefault();
      setViewChanged(true);
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

  return (
    <Box
      display="flex"
      gap="4px"
      borderRadius={theme.borderRadius}
      w="fit-content"
      h="fit-content"
      p="4px"
      className={`e2e-list-map-viewbuttons ${className || ''}`}
      role="tablist"
      background={colors.white}
    >
      <ViewButton
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
      </ViewButton>
      <ViewButton
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
      </ViewButton>
    </Box>
  );
});

export default ViewButtons;
