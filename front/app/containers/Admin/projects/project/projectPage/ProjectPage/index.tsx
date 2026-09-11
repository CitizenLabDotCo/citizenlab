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

import PhonePreview from 'containers/Admin/projects/_shared/components/PhonePreview';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { useParams } from 'utils/router';

import messages from '../messages';

const Preview = styled(PhonePreview)`
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

  ${Preview}:hover &,
  ${Preview}:focus-within & {
    opacity: 0;
    pointer-events: none;
  }
`;

const Overlay = styled(Box)`
  transition: opacity 160ms ease-out, visibility 160ms ease-out;

  ${Preview}:hover &,
  ${Preview}:focus-within & {
    opacity: 1;
    visibility: visible;
  }
`;

const CtaWrapper = styled(Box)`
  transition: transform 160ms ease-out;

  ${Preview}:hover &,
  ${Preview}:focus-within & {
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

  const openContentBuilder = () => {
    clHistory.push(
      `/admin/project-page-builder/projects/${projectId}${window.location.search}`
    );
  };

  return (
    <Preview
      dataCy="e2e-project-page-preview"
      src={`/${locale}/projects/${slug}${window.location.search}`}
      title={formatMessage(messages.projectPagePreviewTitle)}
    >
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
            ariaLabel={formatMessage(messages.editProjectPageInContentBuilder)}
            dataCy="e2e-edit-page-content"
            text={formatMessage(messages.editPageContent)}
          />
        </CtaWrapper>
      </Overlay>
    </Preview>
  );
};

export default ProjectPage;
