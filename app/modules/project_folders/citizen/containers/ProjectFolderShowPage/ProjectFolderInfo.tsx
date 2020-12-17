import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ImageZoom from 'react-medium-image-zoom';
import SharingButtons from 'components/Sharing/SharingButtons';
import FileAttachments from 'components/UI/FileAttachments';

// services
import useProjectFolder from 'modules/project_folders/hooks/useProjectFolder';
import useAuthUser from 'hooks/useAuthUser';
import useProjectFolderFiles from 'modules/project_folders/hooks/useProjectFolderFiles';
import useProjectFolderImages from 'modules/project_folders/hooks/useProjectFolderImages';

// i18n
import T from 'components/T';
import messages from './messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 50px;
  margin-bottom: 100px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 20px;
    margin-bottom: 80px;
  `}
`;

const Left = styled.div`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const Right = styled.div`
  width: 100%;
  max-width: 340px;
  margin-left: 70px;

  ${media.smallerThanMinTablet`
    flex: 1;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-top: 20px;
  `}
`;

const Description = styled.div`
  ${media.smallerThanMinTablet`
    margin-bottom: 20px;
  `}
`;

const ProjectFolderImages = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-top: -5px;
  margin-bottom: 30px;
  width: calc(100% + 10px);

  img {
    margin: 5px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    border: solid 1px ${colors.separation};

    &:first-child {
      width: calc(100% - 10px);
    }

    &:not(:first-child) {
      width: calc(33% - 9px);
    }
  }
`;

interface InputProps {
  projectFolderId: string;
}

interface Props extends InputProps {
  theme: any;
}

const ProjectFolderInfo = ({
  projectFolderId,
  theme,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const projectFolder = useProjectFolder({ projectFolderId });
  const projectFolderImages = useProjectFolderImages(projectFolderId);
  const projectFolderFiles = useProjectFolderFiles(projectFolderId);
  const authUser = useAuthUser();

  const folderUrl = location.href;
  const utmParams = !isNilOrError(authUser)
    ? {
        source: 'share_folder',
        campaign: 'share_content',
        content: authUser.id,
      }
    : {
        source: 'share_folder',
        campaign: 'share_content',
      };

  if (!isNilOrError(projectFolder)) {
    return (
      <Container>
        <ScreenReaderOnly>
          <FormattedMessage
            tagName="h2"
            {...messages.invisibleTitleMainContent}
          />
        </ScreenReaderOnly>
        <Left>
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
        </Left>

        <Right>
          {!isNilOrError(projectFolderImages) &&
            projectFolderImages.data.length > 0 && (
              <ProjectFolderImages className="e2e-projectFolder-images">
                {projectFolderImages.data
                  .filter((projectFolderImage) => projectFolderImage)
                  .map((projectFolderImage) => (
                    <ImageZoom
                      key={projectFolderImage.id}
                      image={{
                        src: projectFolderImage.attributes.versions.large,
                        alt: '',
                      }}
                      zoomImage={{
                        src: projectFolderImage.attributes.versions.large,
                        alt: '',
                      }}
                    />
                  ))}
              </ProjectFolderImages>
            )}
          <T value={projectFolder.attributes.title_multiloc} maxLength={50}>
            {(title) => {
              return (
                <SharingButtons
                  context="folder"
                  url={folderUrl}
                  twitterMessage={formatMessage(messages.twitterMessage, {
                    title,
                  })}
                  whatsAppMessage={formatMessage(messages.whatsAppMessage, {
                    projectFolderName: title,
                  })}
                  utmParams={utmParams}
                />
              );
            }}
          </T>
        </Right>
      </Container>
    );
  }

  return null;
};

export default withTheme(injectIntl<Props>(ProjectFolderInfo));
