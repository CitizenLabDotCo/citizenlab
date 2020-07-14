import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import styled from 'styled-components';
import { SectionTitle, SectionDescription, SectionField } from 'components/admin/Section';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import Error from 'components/UI/Error';
import { isNilOrError } from 'utils/helperUtils';
import { deleteProjectFolder } from 'services/projectFolders';
import clHistory from 'utils/cl-router/history';
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import { adopt } from 'react-adopt';
import Button from 'components/UI/Button';
import { InjectedIntlProps } from 'react-intl';
import GoBackButton from 'components/UI/GoBackButton';
import { IconTooltip, Label } from 'cl2-component-library';
import ProjectFolderForm from './ProjectFolderForm';

const Container = styled.div<({ mode: 'edit' | 'new' }) >`
  display: flex;
  flex-direction: column;
  ${({ mode }) => mode === 'new' ? `
    background: #fff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    box-sizing: border-box;
    padding: 3.5rem 4rem;
    margin-bottom: 60px;
  ` : ''}
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

const DeleteFolderSectionField = styled(SectionField)`
  margin-top: 30px;
`;

const ButtonWrapper = styled.div`
  display: flex;
`;

const goBack = () => {
  clHistory.push('/admin/projects');
};

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
}

const FolderSettings = ({ params, projectFolder, intl: { formatMessage } }: WithRouterProps & DataProps & InjectedIntlProps) => {
  const { projectFolderId } = params;
  const mode = projectFolderId ? 'edit' : 'new';

  // deleting
  const [processingDelete, setProcessingDelete] = useState(false);
  const [deletionError, setDeletionError] = useState(false);

  const deleteFolder = () => {
    if (window.confirm(formatMessage(messages.deleteFolderConfirmation))) {
      setProcessingDelete(true);
      deleteProjectFolder(projectFolderId).then(() => {
        setProcessingDelete(false);
        clHistory.replace('/admin/projects');
      }).catch(() => {
        setProcessingDelete(false);
        setDeletionError(true);
      });
    }
  };

  // ---- Rendering
  if (mode === 'edit' && isNilOrError(projectFolder)) return null;

  return (
    <>
      {mode === 'new' && <StyledGoBackButton onClick={goBack} />}
      <Container mode={mode}>
        {mode === 'edit' ?
          <>
            <SectionTitle>
              {<FormattedMessage {...messages.titleSettingsTab} />}
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleSettingsTab} />
            </SectionDescription>
          </>
          :
          <Header>
            <SectionTitle >
              {<FormattedMessage {...messages.titleNewFolder} />}
            </SectionTitle >
            <SectionDescription>
              <FormattedMessage {...messages.subtitleNewFolder} />
            </SectionDescription>
          </Header>
        }
        <ProjectFolderForm
          mode={mode}
          projectFolderId={projectFolderId}
        />
        {(mode === 'edit' && !isNilOrError(projectFolder)) &&
          <DeleteFolderSectionField>
            <Label>
              <FormattedMessage {...messages.deleteFolderLabel} />
              <IconTooltip content={<FormattedMessage {...messages.deleteFolderLabelTooltip} />} />
            </Label>
            <ButtonWrapper>
              <Button
                type="button"
                icon="delete"
                buttonStyle="delete"
                onClick={deleteFolder}
                processing={processingDelete}
              >
                <FormattedMessage {...messages.deleteButtonLabel} />
              </Button>
            </ButtonWrapper>
            {deletionError && <Error message={messages.deleteFolderError} />}
          </DeleteFolderSectionField>
        }
      </Container>
    </>
  );
};

const FolderSettingsWithHoCs = withRouter(injectIntl(FolderSettings));

const Data = adopt<DataProps, WithRouterProps>({
  projectFolder: ({ params, render }) => <GetProjectFolder projectFolderId={params.projectFolderId}>{render}</GetProjectFolder>,
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <FolderSettingsWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
