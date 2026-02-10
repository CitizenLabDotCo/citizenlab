import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage } from 'utils/cl-intl';
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
    background: #fff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
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
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const mode = projectFolderId ? 'edit' : 'new';

  // ---- Rendering
  if (
    (mode === 'edit' && isNilOrError(projectFolder)) ||
    (projectFolder && isNilOrError(projectFolder.data))
  ) {
    return null;
  }

  return (
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
};

export default FolderSettings;
