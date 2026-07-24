import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { PREVIEW_FRAME_PARAM } from 'utils/isInContentBuilderPreview';
import { useParams } from 'utils/router';

import messages from '../messages';

const PHONE_LOGICAL_WIDTH = 400;
const PHONE_LOGICAL_HEIGHT = 800;
const DEFAULT_PREVIEW_SCALE = 0.8;
const MAX_PREVIEW_SCALE = 1;
const PREVIEW_AREA_PADDING = 32;

// Render the preview interior at a fixed logical phone viewport and scale the
// whole thing down to fit the frame, so components keep their real proportions
// instead of being squeezed into a narrow iframe ("scale, don't shrink"). The
// frame size is derived from the scale, so the same trick fits any viewport.
const Card = styled(Box)`
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;

  &:hover,
  &:focus-within {
    transform: translateY(-2px);
    box-shadow: 0 0 0 3px rgba(44, 110, 125, 0.42),
      0 18px 42px rgba(20, 25, 40, 0.16);
  }
`;

const CornerEditButton = styled(Button)`
  transition: opacity 140ms ease-out;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 0;
    pointer-events: none;
  }
`;

const Overlay = styled(Box)`
  transition: opacity 160ms ease-out, visibility 160ms ease-out;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 1;
    visibility: visible;
  }
`;

const CtaWrapper = styled(Box)`
  transition: transform 160ms ease-out;

  ${Card}:hover &,
  ${Card}:focus-within & {
    transform: translateY(0);
  }
`;

const ProjectPage = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/project-page',
  });
  const { data: project } = useProjectById(projectId);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(DEFAULT_PREVIEW_SCALE);

  // Fit the phone to the visible area: shrink as far as needed so nothing is
  // cut off, grow on large screens up to the cap. Sized against the window
  // (not the container) because the container's height follows its content.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const computeScale = () => {
      const { top, width } = container.getBoundingClientRect();
      const availableWidth = width - 2 * PREVIEW_AREA_PADDING;
      const availableHeight =
        window.innerHeight - top - 2 * PREVIEW_AREA_PADDING;
      const fit = Math.min(
        availableWidth / PHONE_LOGICAL_WIDTH,
        availableHeight / PHONE_LOGICAL_HEIGHT
      );
      setScale(Math.max(0, Math.min(MAX_PREVIEW_SCALE, fit)));
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(container);
    window.addEventListener('resize', computeScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeScale);
    };
  }, [project]);

  if (!project) {
    return (
      <Box
        minHeight="100%"
        background={colors.background}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  const slug = project.data.attributes.slug;

  // Frames the real front-office page, so it needs the marker rather than a
  // preview path to stop trackers booting inside it. See TAN-8309.
  const previewParams = new URLSearchParams(window.location.search);
  previewParams.set(PREVIEW_FRAME_PARAM, 'true');
  const previewSrc = `/${locale}/projects/${slug}?${previewParams.toString()}`;

  const openContentBuilder = () => {
    clHistory.push(
      `/admin/project-page-builder/projects/${projectId}${window.location.search}`
    );
  };

  return (
    <Box
      ref={containerRef}
      minHeight="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={`${PREVIEW_AREA_PADDING}px`}
      background={`radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0) 0 0 / 18px 18px, ${colors.background}`}
    >
      <Card
        data-cy="e2e-project-page-preview"
        position="relative"
        w={`${PHONE_LOGICAL_WIDTH * scale}px`}
        h={`${PHONE_LOGICAL_HEIGHT * scale}px`}
        background={colors.white}
        border={`1.5px solid ${colors.grey300}`}
        borderRadius="22px"
        overflow="hidden"
        boxShadow="0 10px 30px rgba(20, 25, 40, 0.07)"
      >
        <Box
          as="iframe"
          src={previewSrc}
          title={formatMessage(messages.projectPagePreviewTitle)}
          display="block"
          w={`${PHONE_LOGICAL_WIDTH}px`}
          h={`${PHONE_LOGICAL_HEIGHT}px`}
          border="none"
          transform={`scale(${scale})`}
          style={{ transformOrigin: 'top left' }}
        />
        <CornerEditButton
          position="absolute"
          top="12px"
          right="12px"
          buttonStyle="primary"
          size="s"
          icon="edit"
          iconSize="16px"
          borderColor={colors.grey300}
          borderRadius="6px"
          padding="4px 10px"
          fontSize="12px"
          onClick={openContentBuilder}
          text={formatMessage(messages.edit)}
        />
        <Overlay
          position="absolute"
          top="0"
          right="0"
          bottom="0"
          left="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          background="rgba(18, 38, 44, 0.3)"
          opacity={0}
          visibility="hidden"
          // Let wheel/scroll fall through to the iframe so the preview stays scrollable
          pointerEvents="none"
        >
          <CtaWrapper pointerEvents="auto" transform="translateY(7px)">
            <Button
              icon="edit"
              buttonStyle="primary"
              onClick={openContentBuilder}
              ariaLabel={formatMessage(
                messages.editProjectPageInContentBuilder
              )}
              dataCy="e2e-edit-page-content"
              text={formatMessage(messages.editPageContent)}
            />
          </CtaWrapper>
        </Overlay>
      </Card>
    </Box>
  );
};

export default ProjectPage;
