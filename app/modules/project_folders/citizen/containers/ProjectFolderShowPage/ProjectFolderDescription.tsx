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
import { media, fontSizes, isRtl } from 'utils/styleUtils';

// typings
import { IProjectFolderData } from 'modules/project_folders/services/projectFolders';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Title = styled.h1`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xxxxl}px;
  line-height: normal;
  font-weight: 600;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  margin-bottom: 25px;
  padding: 0;

  ${isRtl`
    text-align: right;
  `}

  ${media.smallerThan1280px`
    font-size: ${fontSizes.xxxl}px;
  `}

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
  `}
`;

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
        <Title>
          <T value={projectFolder.attributes.title_multiloc} />
        </Title>
        <Description>
          <QuillEditedContent
            textColor={theme.colorText}
            fontSize="medium"
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
