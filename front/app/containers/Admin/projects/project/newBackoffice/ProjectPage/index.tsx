import React from 'react';

import { Box, Icon, Spinner, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../messages';

// A phone-shaped, scrollable preview of the public project page. Hovering (or
// focusing the edit button) reveals an "Edit page content" call-to-action that
// opens the content builder; the preview itself stays scrollable so the whole
// page can be inspected.
const PHONE_WIDTH = 375;
const PHONE_HEIGHT = 720;

const Card = styled.div`
  position: relative;
  width: ${PHONE_WIDTH}px;
  height: ${PHONE_HEIGHT}px;
  background: ${colors.white};
  border: 2px solid ${colors.grey300};
  border-radius: 24px;
  overflow: hidden;
  transition: border-color 120ms ease-out, box-shadow 120ms ease-out;

  &:hover,
  &:focus-within {
    border-color: ${colors.teal400};
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.14);
  }
`;

const PreviewIframe = styled.iframe`
  display: block;
  width: 100%;
  height: 100%;
  border: none;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.35);
  opacity: 0;
  visibility: hidden;
  transition: opacity 120ms ease-out, visibility 120ms ease-out;
  // Let wheel/scroll fall through to the iframe so the preview stays
  // scrollable; only the edit button below opts back into pointer events.
  pointer-events: none;

  ${Card}:hover &,
  ${Card}:focus-within & {
    opacity: 1;
    visibility: visible;
  }
`;

const EditButton = styled.button`
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  background: ${colors.teal500};
  color: ${colors.white};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const ProjectPage = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) {
    return (
      <Box
        flexGrow={1}
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
  const previewSrc = `/${locale}/projects/${slug}`;

  const openContentBuilder = () => {
    clHistory.push(
      `/admin/description-builder/projects/${projectId}/description`
    );
  };

  return (
    <Box
      flexGrow={1}
      background={colors.background}
      display="flex"
      justifyContent="center"
      overflowY="auto"
      p="32px"
    >
      <Card data-cy="e2e-project-page-preview">
        <PreviewIframe
          src={previewSrc}
          title={formatMessage(messages.projectPagePreviewTitle)}
        />
        <Overlay>
          <EditButton
            type="button"
            onClick={openContentBuilder}
            aria-label={formatMessage(messages.editProjectPageInContentBuilder)}
            data-cy="e2e-edit-page-content"
          >
            <Icon name="edit" width="20px" height="20px" fill={colors.white} />
            {formatMessage(messages.editPageContent)}
          </EditButton>
        </Overlay>
      </Card>
    </Box>
  );
};

export default ProjectPage;
