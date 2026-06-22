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

import { devicePreviewSizes } from 'components/admin/ContentBuilder/EditModePreview/dimensions';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../messages';

const Card = styled.div`
  position: relative;
  width: ${devicePreviewSizes.mobile.frameWidth};
  height: ${devicePreviewSizes.frameHeight};
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
        <Box
          as="iframe"
          src={previewSrc}
          title={formatMessage(messages.projectPagePreviewTitle)}
          display="block"
          w="100%"
          h="100%"
          border="none"
        />
        <Overlay>
          <Box pointerEvents="auto">
            <Button
              icon="edit"
              bgColor={colors.teal500}
              onClick={openContentBuilder}
              ariaLabel={formatMessage(
                messages.editProjectPageInContentBuilder
              )}
              dataCy="e2e-edit-page-content"
              text={formatMessage(messages.editPageContent)}
            />
          </Box>
        </Overlay>
      </Card>
    </Box>
  );
};

export default ProjectPage;
