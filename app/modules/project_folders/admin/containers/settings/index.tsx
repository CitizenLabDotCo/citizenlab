import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import styled from 'styled-components';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import GetProjectFolder, {
  GetProjectFolderChildProps,
} from 'modules/project_folders/resources/GetProjectFolder';
import { adopt } from 'react-adopt';
import GoBackButton from 'components/UI/GoBackButton';
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
  clHistory.push('/admin/projects');
};

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
}

const FolderSettings = ({
  params,
  projectFolder,
}: WithRouterProps & DataProps) => {
  const { projectFolderId } = params;
  const mode = projectFolderId ? 'edit' : 'new';

  // ---- Rendering
  if (mode === 'edit' && isNilOrError(projectFolder)) return null;

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

const FolderSettingsWithHoCs = withRouter(FolderSettings);

const Data = adopt<DataProps, WithRouterProps>({
  projectFolder: ({ params, render }) => (
    <GetProjectFolder projectFolderId={params.projectFolderId}>
      {render}
    </GetProjectFolder>
  ),
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <FolderSettingsWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
