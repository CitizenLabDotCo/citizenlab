import React from 'react';

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
import { useParams } from 'utils/router';

import messages from '../messages';

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
  // Carry the current query string (e.g. ?parallel_participation) into the
  // preview iframe so it renders the same project-page variant the admin is
  // editing (mirrors openContentBuilder below). When the flag is enabled
  // server-side this is a no-op; it only matters when toggled via the URL.
  // TODO(parallel_participation cleanup): drop the query-string forwarding once
  // the flag is removed and the new project page is the default.
  const previewSrc = `/${locale}/projects/${slug}${window.location.search}`;

  const openContentBuilder = () => {
    // Preserve the current query string (e.g. ?parallel_participation) so the
    // builder stays gated-on when the flag is toggled via the URL.
    clHistory.push(
      `/admin/project-page-builder/projects/${projectId}${window.location.search}`
    );
  };

  return (
    <Box
      minHeight="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="32px"
      background={`radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.04) 1px, transparent 0) 0 0 / 18px 18px, ${colors.background}`}
    >
      <Card
        data-cy="e2e-project-page-preview"
        position="relative"
        w={`${phoneFrameWidth}px`}
        h={`${phoneFrameHeight}px`}
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
          transform={`scale(${PHONE_PREVIEW_SCALE})`}
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

const PHONE_LOGICAL_WIDTH = 400;

const PHONE_LOGICAL_HEIGHT = 800;

const PHONE_PREVIEW_SCALE = 0.8;

const phoneFrameWidth = PHONE_LOGICAL_WIDTH * PHONE_PREVIEW_SCALE;

const phoneFrameHeight = PHONE_LOGICAL_HEIGHT * PHONE_PREVIEW_SCALE;
