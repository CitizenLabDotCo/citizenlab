import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField, StyledFileUploader } from './styling';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

import { UploadFile, CLErrors } from 'typings';

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
