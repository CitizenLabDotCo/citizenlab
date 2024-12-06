import React, { memo, useState } from 'react';

import {
  Box,
  media,
  colors,
  Title,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useInView } from 'react-intersection-observer';
import { RouteType } from 'routes';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useProjectImage from 'api/project_images/useProjectImage';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import useProjectById from 'api/projects/useProjectById';
import { getProjectUrl } from 'api/projects/utils';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
import FollowUnfollow from 'components/FollowUnfollow';
import { TLayout } from 'components/ProjectAndFolderCards';
import T from 'components/T';
import Image from 'components/UI/Image';

import { trackEventByName } from 'utils/analytics';
import Link from 'utils/cl-router/Link';

import ContentHeader from './ContentHeader';
import ImagePlaceholder from './ImagePlaceholder';
import ScreenReaderContent from './ScreenReaderContent';
import tracks from './tracks';
import { TProjectCardSize } from './types';

const Container = styled(Link)`
  background: white;
`;

const ProjectImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  &.large {
    width: 50%;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  ${media.phone`
    aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  `}
`;

const ProjectImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const ProjectTitle = styled(Title)`
  color: ${({ theme }) => theme.colors.tenantText};
  margin: 0;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const ProjectDescription = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-top: 16px;

  ${isRtl`
   text-align: right;
 `}
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

interface InputProps {
  projectId: string;
  size: TProjectCardSize;
  layout?: TLayout;
  hideDescriptionPreview?: boolean;
  className?: string;
  showFollowButton?: boolean;
}

const ProjectCard = memo<InputProps>(
  ({
    projectId,
    size,
    layout,
    hideDescriptionPreview,
    className,
    showFollowButton,
  }) => {
    const [visible, setVisible] = useState(false);
    const { ref: progressBarRef } = useInView({
      onChange: (inView) => {
        if (inView) {
          setVisible(true);
        }
      },
    });
    const { data: project } = useProjectById(projectId);

    // We use this hook instead of useProjectImages,
    // because that one doesn't work with our caching system.
    const imageId = project?.data.relationships.project_images?.data[0]?.id;
    const { data: _projectImage } = useProjectImage({
      projectId,
      imageId,
    });

    const projectImage = imageId ? _projectImage : undefined;

    const currentPhaseId =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      project?.data?.relationships?.current_phase?.data?.id ?? null;
    const { data: phase } = usePhase(currentPhaseId);
    const localize = useLocalize();

    const handleProjectCardOnClick = (projectId: string) => {
      trackEventByName(tracks.clickOnProjectCard, { extra: { projectId } });
    };

    const handleCTAOnClick = (projectId: string) => {
      trackEventByName(tracks.clickOnProjectCardCTA, { extra: { projectId } });
    };

    const handleProjectTitleOnClick = (projectId: string) => {
      trackEventByName(tracks.clickOnProjectTitle, { extra: { projectId } });
    };

    if (!project) return null;

    const imageUrl = !projectImage
      ? null
      : projectImage.data.attributes.versions.large;
    const projectImageAltText = localize(
      projectImage?.data.attributes.alt_text_multiloc
    );

    const projectUrl: RouteType = getProjectUrl(project.data.attributes.slug);
    const isArchived =
      project.data.attributes.publication_status === 'archived';
    const showAvatarBubbles = project.data.attributes.participants_count > 0;
    const avatarIds =
      project.data.relationships.avatars &&
      project.data.relationships.avatars.data
        ? project.data.relationships.avatars.data.map((avatar) => avatar.id)
        : [];

    return (
      <Container
        className={[
          className || '',
          layout,
          size,
          'e2e-project-card',
          'e2e-admin-publication-card',
          isArchived ? 'archived' : '',
          hideDescriptionPreview ? 'hideDescriptionPreview' : '',
        ]
          .filter((item) => item)
          .join(' ')}
        to={projectUrl}
        scrollToTop
        onClick={() => {
          handleProjectCardOnClick(project.data.id);
        }}
      >
        <ScreenReaderContent project={project} />

        {size !== 'large' && (
          <ContentHeader
            project={project}
            phase={phase}
            size={size}
            visible={visible}
            progressBarRef={progressBarRef}
            onClickCTA={handleCTAOnClick}
          />
        )}

        <ProjectImageContainer className={size}>
          {imageUrl ? (
            <ProjectImage
              src={imageUrl}
              alt={projectImageAltText}
              cover={true}
            />
          ) : (
            <ImagePlaceholder />
          )}
        </ProjectImageContainer>

        <Box className={size}>
          {size === 'large' && (
            <ContentHeader
              project={project}
              phase={phase}
              size={size}
              visible={visible}
              progressBarRef={progressBarRef}
              onClickCTA={handleCTAOnClick}
            />
          )}

          <Box aria-hidden>
            <ProjectTitle
              variant="h3"
              className="e2e-project-card-project-title"
              data-testid="project-card-project-title"
              onClick={() => {
                handleProjectTitleOnClick(project.data.id);
              }}
            >
              <T value={project.data.attributes.title_multiloc} />
            </ProjectTitle>

            {!hideDescriptionPreview && (
              <T value={project.data.attributes.description_preview_multiloc}>
                {(description) => {
                  if (!isEmpty(description)) {
                    return (
                      <ProjectDescription
                        className="e2e-project-card-project-description-preview"
                        data-testid="project-card-project-description-preview"
                      >
                        {description}
                      </ProjectDescription>
                    );
                  }

                  return null;
                }}
              </T>
            )}
          </Box>

          {showAvatarBubbles && (
            <Box borderTop={`1px solid ${colors.divider}`} pt="16px" mt="30px">
              <ContentFooter className={size}>
                <Box h="100%" display="flex" alignItems="center">
                  <AvatarBubbles
                    size={32}
                    limit={3}
                    avatarIds={avatarIds}
                    userCount={project.data.attributes.participants_count}
                  />
                </Box>
              </ContentFooter>
            </Box>
          )}
          {showFollowButton && (
            <Box display="flex" justifyContent="flex-end" mt="24px">
              <FollowUnfollow
                followableType="projects"
                followableId={project.data.id}
                followersCount={project.data.attributes.followers_count}
                followerId={
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  project.data.relationships.user_follower?.data?.id
                }
                w="100%"
                toolTipType="projectOrFolder"
              />
            </Box>
          )}
        </Box>
      </Container>
    );
  }
);

export default ProjectCard;
