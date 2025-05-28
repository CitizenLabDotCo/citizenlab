import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { UploadFile, CLErrors } from 'typings';

import { SubSectionTitle } from 'components/admin/Section';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { StyledSectionField, StyledFileUploader } from './styling';

interface Props {
  projectFiles: UploadFile[];
  apiErrors: CLErrors;
  handleProjectFileOnAdd: (newProjectFile: UploadFile) => void;
  handleProjectFileOnRemove: (projectFileToRemove: UploadFile) => void;
  onFileReorder: (updatedFiles: UploadFile[]) => void;
}

const AttachmentsDropzone = ({
  projectFiles,
  apiErrors,
  handleProjectFileOnAdd,
  handleProjectFileOnRemove,
  onFileReorder,
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
      dataCy={'e2e-project-file-uploader'}
      onFileAdd={handleProjectFileOnAdd}
      onFileRemove={handleProjectFileOnRemove}
      files={projectFiles}
      apiErrors={apiErrors}
      onFileReorder={onFileReorder}
      enableDragAndDrop
      multiple
    />
  </StyledSectionField>
);

export default AttachmentsDropzone;
