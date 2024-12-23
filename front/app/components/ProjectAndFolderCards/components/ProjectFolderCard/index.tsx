import React, { memo, useCallback } from 'react';

import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
  Icon,
  useBreakpoint,
  Box,
  Title,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { RouteType } from 'routes';
import styled from 'styled-components';

import useAdminPublication from 'api/admin_publications/useAdminPublication';
import {
  getCardImageUrl,
  CARD_IMAGE_ASPECT_RATIO,
} from 'api/project_folder_images/types';
import useProjectFolderImage from 'api/project_folder_images/useProjectFolderImage';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
import FollowUnfollow from 'components/FollowUnfollow';
import { TLayout } from 'components/ProjectAndFolderCards';
import T from 'components/T';
import Image from 'components/UI/Image';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';
import tracks from './tracks';

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

    ${media.phone`
      width: 100%;
    `}
  }

  &.medium {
    width: calc(50% - 13px);
    min-height: 580px;
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 20px;
    padding-bottom: 30px;

    ${media.phone`
      width: 100%;
    `}
  }

  &.small {
    min-height: 540px;
    padding-top: 18px;
    padding-bottom: 25px;

    &.threecolumns {
      ${media.tablet`
        width: calc(50% - 13px);
      `}

      ${media.phone`
        width: 100%;
        min-height: 460px;
      `}
    }

    ${media.phone`
      min-height: 400px;
    `}
  }

  ${media.desktop`
    ${defaultCardHoverStyle};
  `}

  ${media.phone`
    width: 100%;
    min-height: 460px;
  `}

  &.dynamic {
    border: 1px ${colors.grey300} solid;
  }
`;

const FolderImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  &.large {
    width: 50%;
    height: 100%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  ${media.phone`
    aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  `}
`;

const FolderImagePlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.grey300};
`;

const FolderImagePlaceholderIcon = styled(Icon)`
  height: 80px;
  width: 80px;
  fill: ${colors.white};
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

    ${media.tablet`
      padding-left: 20px;
      padding-right: 20px;
    `}
  }

  &.small {
    padding-left: 30px;
    padding-right: 30px;

    ${media.phone`
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
    ${media.desktop`
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

    ${media.phone`
      padding-left: 20px;
      padding-right: 20px;
    `}

    ${media.phone`
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
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

const FolderTitle = styled(Title)`
  color: ${({ theme }) => theme.colors.tenantText};
  margin: 0;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const FolderDescription = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-top: 15px;
`;

const ContentFooter = styled.div`
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;

  &.hidden {
    border: none;

    &.large {
      margin-top: 0px;
    }

    &:not(.large) {
      ${media.phone`
        height: 20px;
        flex-basis: 20px;
        margin: 0px;
        padding: 0px;
      `}
    }
  }
`;

const MapIcon = styled(Icon)`
  fill: ${({ theme }) => theme.colors.tenantSecondary};
  margin-right: 10px;
`;

const MapIconDescription = styled.span`
  font-weight: bold;
  margin-bottom: -2px;
  color: ${({ theme }) => theme.colors.tenantSecondary};
`;

export type TProjectFolderCardSize = 'small' | 'medium' | 'large';

export interface Props {
  folderId: string;
  size: TProjectFolderCardSize;
  layout: TLayout;
  className?: string;
  showFollowButton?: boolean;
}

const ProjectFolderCard = memo<Props>(
  ({ folderId, size, layout, className, showFollowButton }) => {
    const isSmallerThanPhone = useBreakpoint('phone');
    const { data: projectFolder } = useProjectFolderById(folderId);
    const localize = useLocalize();

    // We use this hook instead of useProjectFolderImages
    // because that one doesn't work well with our caching system
    const { data: projectFolderImage } = useProjectFolderImage({
      folderId,
      imageId: projectFolder?.data.relationships.images.data?.[0]?.id,
    });

    const { data: publication } = useAdminPublication(
      projectFolder?.data.relationships.admin_publication.data?.id || null
    );

    const handleProjectCardOnClick = useCallback(
      (projectFolderId: string) => () => {
        trackEventByName(tracks.clickOnProjectCard, {
          projectFolderId,
        });
      },
      []
    );

    const handleProjectTitleOnClick = useCallback(
      (projectFolderId: string) => () => {
        trackEventByName(tracks.clickOnProjectTitle, {
          projectFolderId,
        });
      },
      []
    );

    if (!publication || !projectFolder) {
      return null;
    }

    // Footer
    const avatarIds =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      projectFolder?.data.relationships.avatars &&
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      projectFolder?.data.relationships.avatars.data // TODO: Fix this the next time the file is edited.
        ? // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          projectFolder?.data.relationships.avatars.data.map(
            (avatar) => avatar.id
          )
        : [];
    const showAvatarBubbles =
      projectFolder.data.attributes.participants_count > 0;
    const folderImageAltText = localize(
      projectFolderImage?.data.attributes.alt_text_multiloc
    );

    // Images
    const imageVersions = !projectFolderImage
      ? null
      : projectFolderImage.data.attributes.versions;

    const imageUrl = imageVersions
      ? getCardImageUrl(imageVersions, isSmallerThanPhone, size)
      : null;

    const folderUrl: RouteType = `/folders/${publication.data.attributes.publication_slug}`;
    const numberOfProjectsInFolder =
      publication.data.attributes.visible_children_count;

    const isArchived =
      publication.data.attributes.publication_status === 'archived';
    const contentHeader = (
      <ContentHeader className={`${size} hasContent`} hasLabel={isArchived}>
        {isArchived && (
          <ContentHeaderLabel>
            <FormattedMessage {...messages.archived} />
          </ContentHeaderLabel>
        )}
        <div>
          <MapIcon name="folder-solid" ariaHidden />
          <MapIconDescription
            aria-hidden
            className="e2e-folder-card-numberofprojects"
          >
            {numberOfProjectsInFolder !== 0 && numberOfProjectsInFolder}
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
        <FolderTitle variant="h3">
          <FormattedMessage {...messages.a11y_folderTitle} />
          <T value={publication.data.attributes.publication_title_multiloc} />
        </FolderTitle>

        <FolderDescription>
          <FormattedMessage {...messages.a11y_folderDescription} />
          <T
            value={
              publication.data.attributes
                .publication_description_preview_multiloc
            }
          />
        </FolderDescription>
      </ScreenReaderOnly>
    );

    return (
      <Container
        className={`${className} ${layout} ${size} e2e-folder-card e2e-admin-publication-card`}
        to={folderUrl}
        scrollToTop
        onClick={() => {
          handleProjectCardOnClick(
            publication.data.relationships.publication.data.id
          );
        }}
      >
        {screenReaderContent}
        {size !== 'large' && contentHeader}

        <FolderImageContainer className={size}>
          <FolderImagePlaceholder>
            <FolderImagePlaceholderIcon name="building" />
          </FolderImagePlaceholder>

          {imageUrl && (
            <FolderImage src={imageUrl} alt={folderImageAltText} cover={true} />
          )}
        </FolderImageContainer>

        <FolderContent className={size}>
          {size === 'large' && contentHeader}

          <ContentBody className={size} aria-hidden>
            <FolderTitle
              variant="h3"
              onClick={handleProjectTitleOnClick(
                publication.data.relationships.publication.data.id
              )}
              className="e2e-folder-card-folder-title"
            >
              <T
                value={publication.data.attributes.publication_title_multiloc}
              />
            </FolderTitle>

            <T
              value={
                publication.data.attributes
                  .publication_description_preview_multiloc
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
          {showAvatarBubbles && (
            <Box borderTop={`1px solid ${colors.divider}`} pt="16px" mt="30px">
              <ContentFooter className={size}>
                <Box h="100%" display="flex" alignItems="center">
                  <AvatarBubbles
                    size={32}
                    limit={3}
                    avatarIds={avatarIds}
                    userCount={projectFolder.data.attributes.participants_count}
                  />
                </Box>
              </ContentFooter>
            </Box>
          )}
          {showFollowButton && (
            <Box display="flex" justifyContent="flex-end" mt="24px">
              <FollowUnfollow
                followableType="projects"
                followableId={projectFolder.data.id}
                followersCount={projectFolder.data.attributes.followers_count}
                followerId={
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  projectFolder.data.relationships.user_follower?.data?.id
                }
                w="100%"
                toolTipType="projectOrFolder"
              />
            </Box>
          )}
        </FolderContent>
      </Container>
    );
  }
);

export default ProjectFolderCard;
