import React from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import styled from 'styled-components';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import GoBackButton from 'components/UI/GoBackButton';
import ProjectFolderForm from './ProjectFolderForm';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

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
  clHistory.push('/admin/projects');
};

const FolderSettings = ({ params }: WithRouterProps) => {
  const { projectFolderId } = params;
  const { data: projectFolder } = useProjectFolderById(projectFolderId);
  const mode = projectFolderId ? 'edit' : 'new';

  // ---- Rendering
  if (
    (mode === 'edit' && isNilOrError(projectFolder)) ||
    (projectFolder && isNilOrError(projectFolder.data))
  )
    return null;

  return (
    <>
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
    </>
  );
};

export default withRouter((inputProps) => <FolderSettings {...inputProps} />);
