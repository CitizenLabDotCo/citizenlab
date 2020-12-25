import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// services
import useProjectFolderFiles from 'modules/project_folders/hooks/useProjectFolderFiles';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled, { useTheme } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

const Container = styled.div``;

const Description = styled.div``;

interface Props {
  projectFolder: IProjectFolderData;
  className?: string;
}

const ProjectFolderInfo = memo<Props>(({ projectFolder, className }) => {
  const projectFolderFiles = useProjectFolderFiles(projectFolder.id);
  const theme: any = useTheme();

  if (!isNilOrError(projectFolder)) {
    return (
      <Container className={className || ''}>
        <ScreenReaderOnly>
          <FormattedMessage
            tagName="h2"
            {...messages.invisibleTitleMainContent}
          />
        </ScreenReaderOnly>
        <Description>
          <QuillEditedContent
            textColor={theme.colorText}
            className="e2e-folder-description"
          >
            <T
              value={projectFolder.attributes.description_multiloc}
              supportHtml={true}
            />
          </QuillEditedContent>
        </Description>
        {!isNilOrError(projectFolderFiles) &&
          projectFolderFiles &&
          projectFolderFiles.data.length > 0 && (
            <FileAttachments files={projectFolderFiles.data} />
          )}
      </Container>
    );
  }

  return null;
});

export default ProjectFolderInfo;
