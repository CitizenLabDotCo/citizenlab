import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import bowser from 'bowser';

// router
import Link from 'utils/cl-router/Link';

// components
import { Icon } from 'cl2-component-library';
import Image from 'components/UI/Image';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import useProjectFolderImages from 'modules/project_folders/hooks/useProjectFolderImages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const Container = styled(Link)`
  width: calc(33% - 12px);
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  ${defaultCardStyle};

  &.large {
    width: 100%;
    min-height: 450px;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;

    ${media.smallerThanMinTablet`
      width: 100%;
    `}
  }

  &.medium {
    width: calc(50% - 13px);
    min-height: 580px;
    padding-left: 30px;
    padding-right: 30px;

    ${media.smallerThanMinTablet`
      width: 100%;
    `}
  }

  &.small {
    min-height: 540px;

    &.threecolumns {
      ${media.smallerThanMaxTablet`
        width: calc(50% - 13px);
      `}

      ${media.smallerThanMinTablet`
        width: 100%;
        min-height: 460px;
      `}
    }

    ${media.smallerThanMinTablet`
      min-height: 400px;
    `}
  }

  &.medium {
    padding-top: 20px;
    padding-bottom: 30px;
  }

  &.small {
    padding-top: 18px;
    padding-bottom: 25px;
  }

  &.desktop {
    ${defaultCardHoverStyle};
  }

  ${media.smallerThanMinTablet`
    width: 100%;
    min-height: 460px;
  `}
`;

const FolderImageContainer = styled.div`
  width: 100%;
  height: 254px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 254px;
  display: flex;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  &.large {
    width: 50%;
    height: 100%;
    flex-basis: 50%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &.small {
    height: 224px;
    flex-basis: 224px;
  }
`;

const FolderImagePlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.placeholderBg};
`;

const FolderImagePlaceholderIcon = styled(Icon)`
  height: 45px;
  fill: #fff;
`;

const FolderImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const FolderContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  &.large {
    padding-top: 18px;
    padding-bottom: 35px;
    padding-left: 68px;
    padding-right: 32px;

    ${media.smallerThanMaxTablet`
      padding-left: 20px;
      padding-right: 20px;
    `}
  }

  &.small {
    padding-left: 30px;
    padding-right: 30px;

    ${media.smallerThanMinTablet`
      padding-left: 20px;
      padding-right: 20px;
    `};
  }
`;

const ContentHeaderHeight = 39;
const ContentHeaderBottomMargin = 13;

const ContentHeader = styled.div<{ hasLabel: boolean }>`
  display: flex;
  justify-content: ${({ hasLabel }) =>
    hasLabel ? 'space-between' : 'flex-end'};
  align-items: center;
  padding-right: 0;
  padding-left: 0;
  height: ${ContentHeaderHeight}px;
  margin-bottom: ${ContentHeaderBottomMargin}px;

  &.noContent {
    ${media.biggerThanMinTablet`
      height: ${ContentHeaderHeight + ContentHeaderBottomMargin}px;
    `}
  }

  &.hasContent {
    &.large {
      margin-bottom: 0px;
      border-bottom: solid 1px #e8e8e8;
    }
  }

  &.small {
    padding-left: 30px;
    padding-right: 30px;

    ${media.smallerThanMinTablet`
      padding-left: 20px;
      padding-right: 20px;
    `}

    ${media.smallPhone`
      padding-left: 10px;
      padding-right: 10px;
    `}
  }

  &.large {
    padding-bottom: 10px;
  }
`;

const ContentBody = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 20px;

  &.large {
    max-width: 400px;
    justify-content: center;
  }
`;

const ContentHeaderLabel = styled.span`
  height: ${ContentHeaderHeight}px;
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

const FolderTitle = styled.h3`
  line-height: normal;
  font-weight: 500;
  font-size: ${fontSizes.xl}px;
  color: ${({ theme }) => theme.colorText};
  margin: 0;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const FolderDescription = styled.div`
  color: ${darken(0.1, colors.label)};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-top: 15px;
`;

const MapIcon = styled(Icon)`
  width: 27px;
  height: 21px;
  fill: ${({ theme }) => theme.colorSecondary};
  margin-right: 10px;
`;

const MapIconDescription = styled.span`
  font-weight: bold;
  margin-bottom: -2px;
  color: ${({ theme }) => theme.colorSecondary};
`;

export interface Props {
  publication: IAdminPublicationContent;
  size: 'small' | 'medium' | 'large';
  layout: 'dynamic' | 'threecolumns' | 'twocolumns';
  className?: string;
}

const ProjectFolderCard = memo<Props>(
  ({ publication, size, layout, className }) => {
    const projectFolderImages = useProjectFolderImages(
      publication.publicationId
    );

    const handleProjectCardOnClick = useCallback(
      (projectFolderId: string) => () => {
        trackEventByName(tracks.clickOnProjectCard, {
          extra: { projectFolderId },
        });
      },
      []
    );

    const handleProjectTitleOnClick = useCallback(
      (projectFolderId: string) => () => {
        trackEventByName(tracks.clickOnProjectTitle, {
          extra: { projectFolderId },
        });
      },
      []
    );

    const imageUrl =
      !isNilOrError(projectFolderImages) && projectFolderImages.data.length > 0
        ? projectFolderImages.data?.[0].attributes?.versions.medium
        : null;

    const folderUrl = `/folders/${publication.attributes.publication_slug}`;
    const numberOfProjectsInFolder =
      publication.attributes.visible_children_count;

    const isArchived = publication.attributes.publication_status === 'archived';
    const contentHeader = (
      <ContentHeader className={`${size} hasContent`} hasLabel={isArchived}>
        {isArchived && (
          <ContentHeaderLabel className="e2e-project-card-archived-label">
            <FormattedMessage {...messages.archived} />
          </ContentHeaderLabel>
        )}
        <div>
          <MapIcon name="folder" ariaHidden />
          <MapIconDescription
            aria-hidden
            className="e2e-folder-card-numberofprojects"
          >
            {numberOfProjectsInFolder}
          </MapIconDescription>
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.numberOfProjectsInFolder}
              values={{ numberOfProjectsInFolder }}
            />
          </ScreenReaderOnly>
        </div>
      </ContentHeader>
    );

    const screenReaderContent = (
      <ScreenReaderOnly>
        <FolderTitle>
          <FormattedMessage {...messages.a11y_folderTitle} />
          <T value={publication.attributes.publication_title_multiloc} />
        </FolderTitle>

        <FolderDescription>
          <FormattedMessage {...messages.a11y_folderDescription} />
          <T
            value={
              publication.attributes.publication_description_preview_multiloc
            }
          />
        </FolderDescription>
      </ScreenReaderOnly>
    );

    return (
      <Container
        className={`${className} ${layout} ${size} ${
          !(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'
        } e2e-folder-card e2e-admin-publication-card`}
        to={folderUrl}
        onClick={handleProjectCardOnClick(publication.publicationId)}
      >
        {screenReaderContent}
        {size !== 'large' && contentHeader}

        <FolderImageContainer className={size}>
          <FolderImagePlaceholder>
            <FolderImagePlaceholderIcon name="project" />
          </FolderImagePlaceholder>

          {imageUrl && <FolderImage src={imageUrl} alt="" cover={true} />}
        </FolderImageContainer>

        <FolderContent className={size}>
          {size === 'large' && contentHeader}

          <ContentBody className={size} aria-hidden>
            <FolderTitle
              onClick={handleProjectTitleOnClick(publication.publicationId)}
              className="e2e-folder-card-folder-title"
            >
              <T value={publication.attributes.publication_title_multiloc} />
            </FolderTitle>

            <T
              value={
                publication.attributes.publication_description_preview_multiloc
              }
            >
              {(description) => {
                if (!isEmpty(description)) {
                  return (
                    <FolderDescription className="e2e-folder-card-folder-description-preview">
                      {description}
                    </FolderDescription>
                  );
                }

                return null;
              }}
            </T>
          </ContentBody>
        </FolderContent>
      </Container>
    );
  }
);

export default ProjectFolderCard;
