import React from 'react';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField, StyledFileUploader } from './styling';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
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
      id="test-to-fix"
      onFileAdd={handleProjectFileOnAdd}
      onFileRemove={handleProjectFileOnRemove}
      files={projectFiles}
      apiErrors={apiErrors}
    />
  </StyledSectionField>
);
