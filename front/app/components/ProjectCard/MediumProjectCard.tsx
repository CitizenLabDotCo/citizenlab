import React, { memo } from 'react';

import {
  Icon,
  Box,
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
  isRtl,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { RouteType } from 'routes';
import styled, { useTheme } from 'styled-components';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getInputTerm } from 'api/phases/utils';
import useProjectImage from 'api/project_images/useProjectImage';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import useProjectById from 'api/projects/useProjectById';
import { getProjectUrl } from 'api/projects/utils';

import AvatarBubbles from 'components/AvatarBubbles';
import FollowUnfollow from 'components/FollowUnfollow';
import T from 'components/T';

import Link from 'utils/cl-router/Link';

import {
  handleProjectCardOnClick,
  handleProjectTitleOnClick,
  ProjectImage,
  ProjectTitle,
} from './utils';
import ProjectHeader, {
  ContentHeaderBottomMargin,
  ContentHeaderHeight,
} from './ProjectHeader';
import ScreenReaderContent from './ScreenReaderContent';

const Container = styled(Link)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  min-height: 580px;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 20px;
  padding-bottom: 30px;
  ${defaultCardStyle};

  ${media.phone`
    width: 100%;
  `}

  ${media.desktop`
    ${defaultCardHoverStyle};
  `}
`;

const ProjectImageContainer = styled.div`
  width: 100%;
  display: flex;
  aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  ${media.phone`
    aspect-ratio: ${CARD_IMAGE_ASPECT_RATIO} / 1;
  `}
`;

const ProjectContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.phone`
    padding-left: 20px;
    padding-right: 20px;
  `}

  ${isRtl`
    align-items: flex-end;
  `}
`;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  &.noContent {
    ${media.desktop`
      height: ${ContentHeaderHeight + ContentHeaderBottomMargin}px;
    `}
  }

  &.hasRightContent.noLeftContent {
    justify-content: flex-end;
  }

  &.hasContent {
    margin-bottom: ${ContentHeaderBottomMargin}px;
  }

  ${isRtl`
    text-align: right;
  `}
`;

const ContentBody = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

const ProjectDescription = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-top: 15px;

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
  }

  ${media.phone`
    height: 20px;
    flex-basis: 20px;
    margin: 0px;
    padding: 0px;
  `}
`;

export interface InputProps {
  projectId: string;
  hideDescriptionPreview?: boolean;
  className?: string;
  showFollowButton?: boolean;
}

const MediumProjectCard = memo<InputProps>(
  ({ projectId, hideDescriptionPreview, className, showFollowButton }) => {
    const { data: project } = useProjectById(projectId);
    const { data: projectImage } = useProjectImage({
      projectId,
      imageId: project?.data.relationships.project_images?.data[0]?.id,
    });
    const currentPhaseId =
      project?.data?.relationships?.current_phase?.data?.id ?? null;
    const { data: phase } = usePhase(currentPhaseId);
    const fetchPhases = project && !currentPhaseId;
    const { data: phases } = usePhases(
      fetchPhases ? project.data.id : undefined
    );
    const theme = useTheme();

    if (project) {
      const imageUrl = !projectImage
        ? null
        : projectImage.data.attributes.versions?.large;
      const projectUrl: RouteType = getProjectUrl(project.data);
      const isArchived =
        project.data.attributes.publication_status === 'archived';
      const hasAvatars =
        project.data.relationships.avatars &&
        project.data.relationships.avatars.data &&
        project.data.relationships.avatars.data.length > 0;
      const showFooter = hasAvatars;
      const avatarIds =
        project.data.relationships.avatars &&
        project.data.relationships.avatars.data
          ? project.data.relationships.avatars.data.map((avatar) => avatar.id)
          : [];
      const inputTerm = getInputTerm(phases?.data, phase?.data);

      return (
        <Container
          className={[
            className || '',
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
          <ProjectHeader
            phase={phase}
            inputTerm={inputTerm}
            project={project}
            ContentHeaderComponent={ContentHeader}
          />

          <ProjectImageContainer>
            {imageUrl ? (
              <ProjectImage src={imageUrl} alt="" cover={true} />
            ) : (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                flex="1"
                background={colors.grey300}
              >
                <Icon
                  name="building"
                  width="80px"
                  height="80px"
                  fill={colors.white}
                />
              </Box>
            )}
          </ProjectImageContainer>

          <ProjectContent>
            <ContentBody aria-hidden>
              <ProjectTitle
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
            </ContentBody>

            {hasAvatars && (
              <Box
                borderTop={`1px solid ${colors.divider}`}
                pt="16px"
                mt="30px"
              >
                <ContentFooter className={`${!showFooter ? 'hidden' : ''}`}>
                  <Box h="100%" display="flex" alignItems="center">
                    {hasAvatars && (
                      <AvatarBubbles
                        size={32}
                        limit={3}
                        userCountBgColor={theme.colors.tenantPrimary}
                        avatarIds={avatarIds}
                        userCount={project.data.attributes.participants_count}
                      />
                    )}
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
                    project.data.relationships.user_follower?.data?.id
                  }
                  w="100%"
                  toolTipType="projectOrFolder"
                />
              </Box>
            )}
          </ProjectContent>
        </Container>
      );
    }

    return null;
  }
);

export default MediumProjectCard;
