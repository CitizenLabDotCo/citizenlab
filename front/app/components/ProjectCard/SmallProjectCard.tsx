import React, { memo, useState } from 'react';

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
import { isEmpty, round } from 'lodash-es';
import moment from 'moment';
import { rgba, darken } from 'polished';
import { useInView } from 'react-intersection-observer';
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
import Image from 'components/UI/Image';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import CTAMessage from './CTAMessage';
import {
  handleCTAOnClick,
  handleProjectCardOnClick,
  handleProjectTitleOnClick,
} from './Helpers';
import messages from './messages';
import ScreenReaderContent from './ScreenReaderContent';

const Container = styled(Link)<{ hideDescriptionPreview?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  min-height: 540px;
  padding-top: 18px;
  padding-bottom: 25px;

  &.hideDescriptionPreview {
    min-height: 490px;
  }
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

const ProjectImage = styled(Image)`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const ProjectContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-left: 30px;
  padding-right: 30px;

  ${media.phone`
    padding-left: 20px;
    padding-right: 20px;
  `}

  ${isRtl`
    align-items: flex-end;
  `}
`;

const ContentHeaderHeight = 39;
const ContentHeaderBottomMargin = 13;

const ContentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30px;
  padding-right: 30px;

  &.noContent {
    ${media.desktop`
      height: ${ContentHeaderHeight + ContentHeaderBottomMargin}px;
    `}
  }

  ${media.phone`
    padding-left: 10px;
    padding-right: 10px;
  `}

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

const TimeRemaining = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  margin-bottom: 7px;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 130px;
  height: 5px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: #d6dade;
`;

const ProgressBarOverlay = styled.div<{ progress: number }>`
  width: 0px;
  height: 100%;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.error};
  transition: width 1000ms cubic-bezier(0.19, 1, 0.22, 1);
  will-change: width;

  &.visible {
    width: ${(props) => props.progress}%;
  }
`;

const ProjectLabel = styled.div`
  // darkened to have higher chances of solid color contrast
  color: ${({ theme }) => darken(0.05, theme.colors.tenantSecondary)};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  padding-left: 14px;
  padding-right: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${({ theme }) => rgba(theme.colors.tenantSecondary, 0.1)};
`;

const ContentBody = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
`;

const ProjectTitle = styled.h3`
  line-height: normal;
  font-weight: 500;
  font-size: ${fontSizes.xl}px;
  color: ${({ theme }) => theme.colors.tenantText};
  margin: 0;
  padding: 0;

  ${isRtl`
    text-align: right;
  `}

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
    margin-top: 0px;
  }

  ${media.phone`
    height: 20px;
    flex-basis: 20px;
    margin: 0px;
    padding: 0px;
  `}
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

export interface InputProps {
  projectId: string;
  hideDescriptionPreview?: boolean;
  className?: string;
  showFollowButton?: boolean;
}

const SmallProjectCard = memo<InputProps>(
  ({ projectId, hideDescriptionPreview, className, showFollowButton }) => {
    const { ref: progressBarRef } = useInView({
      onChange: (inView) => {
        if (inView) {
          setVisible(true);
        }
      },
    });
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
    const [visible, setVisible] = useState(false);

    if (project) {
      const imageUrl = !projectImage
        ? null
        : projectImage.data.attributes.versions?.large;
      const projectUrl: RouteType = getProjectUrl(project.data);
      const isFinished = project.data.attributes.timeline_active === 'past';
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
      const startAt = phase?.data.attributes.start_at;
      const endAt = phase?.data.attributes.end_at;
      const timeRemaining = endAt
        ? moment.duration(moment(endAt).endOf('day').diff(moment())).humanize()
        : null;
      let countdown: JSX.Element | null = null;
      const inputTerm = getInputTerm(phases?.data, phase?.data);

      if (isArchived) {
        countdown = (
          <ContentHeaderLabel>
            <FormattedMessage {...messages.archived} />
          </ContentHeaderLabel>
        );
      } else if (isFinished) {
        countdown = (
          <ContentHeaderLabel>
            <FormattedMessage {...messages.finished} />
          </ContentHeaderLabel>
        );
      } else if (timeRemaining) {
        const totalDays = moment
          .duration(moment(endAt).diff(moment(startAt)))
          .asDays();
        const pastDays = moment
          .duration(moment(moment()).diff(moment(startAt)))
          .asDays();
        const progress = round((pastDays / totalDays) * 100, 1);
        countdown = (
          <Box mt="4px" className="e2e-project-card-time-remaining">
            <TimeRemaining>
              <FormattedMessage
                {...messages.remaining}
                values={{ timeRemaining }}
              />
            </TimeRemaining>
            <ProgressBar ref={progressBarRef} aria-hidden>
              <ProgressBarOverlay
                progress={progress}
                className={visible ? 'visible' : ''}
              />
            </ProgressBar>
          </Box>
        );
      }

      const ctaMessage = (
        <CTAMessage phase={phase} inputTerm={inputTerm} project={project} />
      );

      const contentHeader = (
        <ContentHeader
          className={`${
            !ctaMessage ? undefined : 'hasContent hasRightContent'
          } ${!countdown ? 'noLeftContent' : 'hasContent hasLeftContent'} ${
            !ctaMessage && !countdown ? 'noContent' : ''
          }`}
        >
          {countdown && (
            <Box
              minHeight={`${ContentHeaderHeight}px`}
              display="flex"
              flexGrow={0}
              flexShrink={1}
              flexBasis={140}
              mr="15px"
            >
              {countdown}
            </Box>
          )}

          {ctaMessage && !isFinished && !isArchived && (
            <Box
              minHeight={`${ContentHeaderHeight}px`}
              className={`hasProgressBar`}
            >
              <ProjectLabel
                onClick={() => {
                  handleCTAOnClick(project.data.id);
                }}
                className="e2e-project-card-cta"
              >
                {ctaMessage}
              </ProjectLabel>
            </Box>
          )}
        </ContentHeader>
      );

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
          {contentHeader}

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

export default SmallProjectCard;
