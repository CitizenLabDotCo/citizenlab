import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty } from 'lodash-es';
import bowser from 'bowser';

// router
import Link from 'utils/cl-router/Link';

// components
import Icon from 'components/UI/Icon';
import LazyImage from 'components/LazyImage';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import useProjectFolderImages from 'hooks/useProjectFolderImages';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const Container = styled(Link)`
  width: calc(33% - 12px);
  min-height: 560px;
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3), 0px 1px 5px -2px rgba(152, 162, 179, 0.3);

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

  &.small,
  &.medium {
    padding-top: 20px;
    padding-bottom: 30px;
  }

  &.desktop {
    transition: all 150ms ease-out;

    &:hover {
      box-shadow: 0px 4px 12px 0px rgba(152, 162, 179, 0.35), 0px 2px 2px -1px rgba(152, 162, 179, 0.3);
      transform: translate(0px, -2px);
    }
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

const FolderImage = styled(LazyImage)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
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

const ContentHeader = styled.div`
  display: flex;
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
    padding: 0 30px;

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
  color: ${colors.label};
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

export interface InputProps {
  publication: IAdminPublicationContent;
  size: 'small' | 'medium' | 'large';
  layout: 'dynamic' | 'threecolumns' | 'twocolumns';
  className?: string;
}

interface Props extends InputProps {
  theme?: any;
}

const ProjectFolderCard = memo(({
  publication,
  size,
  layout,
  className,
  theme,
}: Props) => {
  const projectFolderImages = useProjectFolderImages(publication.publicationId);

  const handleProjectCardOnClick = useCallback((projectFolderId: string) => () => {
    trackEventByName(tracks.clickOnProjectCard, { extra: { projectFolderId } });
  }, []);

  const handleProjectTitleOnClick = useCallback((projectFolderId: string) => () => {
    trackEventByName(tracks.clickOnProjectTitle, { extra: { projectFolderId } });
  }, []);

  const imageUrl = !isNilOrError(projectFolderImages) && projectFolderImages.data.length > 0
    ? projectFolderImages.data ?.[0].attributes ?.versions.medium
      : null;

  const folderUrl = `/folders/${publication.attributes.publication_slug}`;
  const numberOfProjects = publication.attributes.visible_children_count;

  const contentHeader = (
    <ContentHeader className={`${size} hasContent`}>
      <MapIcon
        name="folder"
        ariaHidden
        colorTheme={{
          clIconPrimary: `${theme.colorSecondary}`,
          clIconSecondary: `${theme.colorSecondary}`,
        }}
      />
      <MapIconDescription aria-hidden className="e2e-folder-card-numberofprojects">
        {numberOfProjects}
      </MapIconDescription>
      <ScreenReaderOnly>
        <FormattedMessage {...messages.numberOfFolders} values={{ numberOfProjects }} />
      </ScreenReaderOnly>
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
        <T value={publication.attributes.publication_description_preview_multiloc} />
      </FolderDescription>
    </ScreenReaderOnly>
  );

  return (
    <Container
      className={`${className} ${layout} ${size} ${!(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'} e2e-folder-card e2e-admin-publication-card`}
      to={folderUrl}
      onClick={handleProjectCardOnClick(publication.publicationId)}
    >
      {screenReaderContent}
      {size !== 'large' && contentHeader}

      <FolderImageContainer className={size}>
        <FolderImagePlaceholder>
          <FolderImagePlaceholderIcon name="project" />
        </FolderImagePlaceholder>

        {imageUrl &&
          <FolderImage
            src={imageUrl}
            alt=""
            cover={true}
          />
        }
      </FolderImageContainer>

      <FolderContent className={size}>
        {size === 'large' && contentHeader}

        <ContentBody className={size} aria-hidden>
          <FolderTitle onClick={handleProjectTitleOnClick(publication.publicationId)} className="e2e-folder-card-folder-title">
            <T value={publication.attributes.publication_title_multiloc} />
          </FolderTitle>

          <T value={publication.attributes.publication_description_preview_multiloc}>
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
});

export default withTheme(ProjectFolderCard);
