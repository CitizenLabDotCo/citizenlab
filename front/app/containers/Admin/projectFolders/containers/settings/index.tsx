import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocale from 'hooks/useLocale';

import PagePreview from 'components/admin/PagePreview';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import ProjectFolderForm from './ProjectFolderForm';

const Container = styled.div<{ mode: 'edit' | 'new' }>`
  display: flex;
  flex-direction: column;
  ${({ mode }) =>
    mode === 'new'
      ? `
    background: ${colors.white};
    border-radius: 3px;
    border: 1px solid ${colors.borderLight};
    box-sizing: border-box;
    padding: 3.5rem 4rem;
    margin-bottom: 60px;
  `
      : ''}
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-bottom: 50px;
`;

const StyledGoBackButton = styled(GoBackButton)`
  display: flex;
  justify-content: start;
  margin-bottom: 20px;
`;

const goBack = () => {
  clHistory.goBack();
};

const FolderSettings = () => {
  const { projectFolderId } = useParams({ strict: false }) as Record<
    string,
    string
  >;
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: projectFolder, dataUpdatedAt } =
    useProjectFolderById(projectFolderId);
  const mode = projectFolderId ? 'edit' : 'new';

  // ---- Rendering
  if (
    (mode === 'edit' && isNilOrError(projectFolder)) ||
    (projectFolder && isNilOrError(projectFolder.data))
  ) {
    return null;
  }

  const settings = (
    <Box p={mode === 'new' ? '40px' : '0'}>
      {mode === 'new' && <StyledGoBackButton onClick={goBack} />}
      <Container mode={mode}>
        {mode === 'edit' ? (
          <>
            <SectionTitle>
              {<FormattedMessage {...messages.titleSettingsTab} />}
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleSettingsTab} />
            </SectionDescription>
          </>
        ) : (
          <Header>
            <SectionTitle>
              {<FormattedMessage {...messages.titleNewFolder} />}
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleNewFolder} />
            </SectionDescription>
          </Header>
        )}
        <ProjectFolderForm mode={mode} projectFolderId={projectFolderId} />
      </Container>
    </Box>
  );

  // A new folder has no page to preview yet.
  if (!projectFolder) return settings;

  const openDescriptionBuilder = () => {
    clHistory.push(
      `/admin/description-builder/folders/${projectFolderId}/description`
    );
  };

  return (
    <Box display="flex" gap="24px" alignItems="flex-start">
      <Box flex="1" minWidth="0">
        {settings}
      </Box>
      {/* The settings run longer than a screen, so the preview stays in view below the header.
          Its top margin is the section title's (the h2 default, 0.83em of 25px), to line up. */}
      <Box
        flex="1"
        minWidth="0"
        mt="21px"
        position="sticky"
        top={`${stylingConsts.menuHeight + 20}px`}
      >
        {/* The frame runs its own copy of the app, so it is remounted to show a save. */}
        <PagePreview
          key={dataUpdatedAt}
          src={`/${locale}/folders/${projectFolder.data.attributes.slug}`}
          iframeTitle={formatMessage(messages.folderPreviewTitle)}
          editPageContentAriaLabel={formatMessage(
            messages.editDescriptionInContentBuilder
          )}
          editPageContentText={formatMessage(messages.editDescription)}
          onEdit={openDescriptionBuilder}
          dataCy="e2e-folder-preview"
          alignTop
        />
      </Box>
    </Box>
  );
};

export default FolderSettings;
