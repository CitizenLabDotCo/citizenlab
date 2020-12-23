import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import FileAttachments from 'components/UI/FileAttachments';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// services
import useProjectFolder from 'modules/project_folders/hooks/useProjectFolder';
import useProjectFolderFiles from 'modules/project_folders/hooks/useProjectFolderFiles';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled, { useTheme } from 'styled-components';
// import { media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div``;

const Description = styled.div``;

interface Props {
  projectFolderId: string;
  className?: string;
}

const ProjectFolderInfo = memo<Props>(({ projectFolderId, className }) => {
  const projectFolder = useProjectFolder({ projectFolderId });
  const projectFolderFiles = useProjectFolderFiles(projectFolderId);
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
