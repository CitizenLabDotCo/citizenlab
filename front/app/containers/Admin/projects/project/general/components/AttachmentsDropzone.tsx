import React from 'react';
// typings
import { UploadFile, CLErrors } from 'typings';
// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { SubSectionTitle } from 'components/admin/Section';
import messages from '../messages';
import { StyledSectionField, StyledFileUploader } from './styling';

interface Props {
  projectFiles: UploadFile[];
  apiErrors: CLErrors;
  handleProjectFileOnAdd: (newProjectFile: UploadFile) => void;
  handleProjectFileOnRemove: (projectFileToRemove: UploadFile) => void;
}

export default ({
  projectFiles,
  apiErrors,
  handleProjectFileOnAdd,
  handleProjectFileOnRemove,
}: Props) => (
  <StyledSectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.fileUploadLabel} />
      <IconTooltip
        content={<FormattedMessage {...messages.fileUploadLabelTooltip} />}
      />
    </SubSectionTitle>
    <StyledFileUploader
      id="e2e-project-file-uploader"
      onFileAdd={handleProjectFileOnAdd}
      onFileRemove={handleProjectFileOnRemove}
      files={projectFiles}
      apiErrors={apiErrors}
    />
  </StyledSectionField>
);
