import React, { FormEvent, useRef, KeyboardEvent } from 'react';

import {
  Icon,
  defaultStyles,
  fontSizes,
  colors,
  Box,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled, { useTheme } from 'styled-components';

import { PresentationMode } from 'api/phases/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

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
  selectedView: PresentationMode;
  onClick: (selectedView: PresentationMode) => void;
  locationEnabled?: boolean;
  defaultView?: PresentationMode;
}

const ViewButtons = ({
  className,
  selectedView,
  onClick,
  locationEnabled,
  defaultView,
}: Props) => {
  const theme = useTheme();
  const ideaFeedEnabled = useFeatureFlag({ name: 'idea_feed' });
  const listButtonRef = useRef<HTMLButtonElement | null>(null);
  const mapButtonRef = useRef<HTMLButtonElement | null>(null);
  const feedButtonRef = useRef<HTMLButtonElement | null>(null);

  const showMapButton = !!locationEnabled;
  const showFeedButton = ideaFeedEnabled && defaultView === 'feed';

  if (!showMapButton && !showFeedButton) {
    return null;
  }

  const handleOnClick =
    (selectedView: PresentationMode) => (event: FormEvent) => {
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
      const views: PresentationMode[] = [
        'card',
        ...(showMapButton ? ['map' as const] : []),
        ...(showFeedButton ? ['feed' as const] : []),
      ];
      const currentIndex = views.indexOf(selectedView);
      const nextIndex = arrowRightPressed
        ? (currentIndex + 1) % views.length
        : (currentIndex - 1 + views.length) % views.length;
      onClick(views[nextIndex]);
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
        aria-selected={selectedView === 'card'}
        tabIndex={selectedView === 'card' ? 0 : -1}
        id="view-tab-1"
        aria-controls="view-panel-1"
        onClick={handleOnClick('card')}
        ref={listButtonRef}
        onKeyDown={handleTabListOnKeyDown}
        active={selectedView === 'card'}
      >
        <StyledIcon name="menu" />
        <FormattedMessage {...messages.list} />
      </ViewButton>
      {showMapButton && (
        <ViewButton
          role="tab"
          aria-selected={selectedView === 'map'}
          tabIndex={selectedView === 'map' ? 0 : -1}
          id="view-tab-2"
          aria-controls="view-panel-2"
          onClick={handleOnClick('map')}
          ref={mapButtonRef}
          onKeyDown={handleTabListOnKeyDown}
          active={selectedView === 'map'}
        >
          <StyledIcon name="map" />
          <FormattedMessage {...messages.map} />
        </ViewButton>
      )}
      {showFeedButton && (
        <ViewButton
          role="tab"
          aria-selected={selectedView === 'feed'}
          tabIndex={selectedView === 'feed' ? 0 : -1}
          id="view-tab-3"
          aria-controls="view-panel-3"
          onClick={handleOnClick('feed')}
          ref={feedButtonRef}
          onKeyDown={handleTabListOnKeyDown}
          active={selectedView === 'feed'}
        >
          <StyledIcon name="idea" />
          <FormattedMessage {...messages.feed} />
        </ViewButton>
      )}
    </Box>
  );
};

export default ViewButtons;
