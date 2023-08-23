import React, { memo, useState } from 'react';
import { isEmpty, isNumber, round } from 'lodash-es';
import moment from 'moment';
import Observer from '@researchgate/react-intersection-observer';
import bowser from 'bowser';
import { TLayout } from 'components/ProjectAndFolderCards';

// router
import Link from 'utils/cl-router/Link';

// components
import { Icon, Box } from '@citizenlab/cl2-component-library';
import Image from 'components/UI/Image';
import AvatarBubbles from 'components/AvatarBubbles';
import FollowUnfollow from 'components/FollowUnfollow';

// services
import { getProjectUrl } from 'api/projects/utils';
import { getInputTerm } from 'services/participationContexts';
import { getIdeaPostingRules } from 'services/actionTakingRules';

// resources
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import useAuthUser from 'api/me/useAuthUser';
import useProjectImages, {
  CARD_IMAGE_ASPECT_RATIO,
} from 'api/project_images/useProjectImages';

// i18n
import T from 'components/T';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { useTheme } from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
  isRtl,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { rgba, darken } from 'polished';
import { getInputTermMessage } from 'utils/i18n';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

const Container = styled(Link)<{ hideDescriptionPreview?: boolean }>`
  width: calc(33% - 12px);
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  position: relative;
  cursor: pointer;
  ${defaultCardStyle};

  &.large {
    width: 100%;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;

    ${isRtl`
        flex-direction: row-reverse;
    `}

    ${media.phone`
      width: 100%;
    `}
  }

  &.medium {
    width: calc(50% - 13px);
    min-height: 580px;
    padding-left: 30px;
    padding-right: 30px;

    ${media.phone`
      width: 100%;
    `}
  }

  &.small {
    min-height: 540px;

    &.hideDescriptionPreview {
      min-height: 490px;
    }

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

  ${media.phone`
    width: 100%;
    min-height: 460px;
  `}
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

const ProjectContent = styled.div`
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

  ${isRtl`
    align-items: flex-end;

    &.large {
        padding-right: 68px;
        padding-left: 32px;
    }
  `}
`;

const ContentHeaderHeight = 39;
const ContentHeaderBottomMargin = 13;

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

    &.large {
      margin-bottom: 0px;
      padding-bottom: ${ContentHeaderBottomMargin}px;
      border-bottom: solid 1px #e0e0e0;
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

  &.large {
    max-width: 400px;
    justify-content: center;
  }
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

const ContentHeaderLabel = styled.span`
  height: ${ContentHeaderHeight}px;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

const ProjectMetaItems = styled.div`
  height: 100%;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  margin-left: 24px;

  &.first {
    margin-left: 0px;
  }

  ${media.phone`
    margin-left: 20px;
  `};
`;

const MetaItemIcon = styled(Icon)`
  fill: ${({ theme }) => theme.colors.tenantPrimary};
`;

const CommentIcon = styled(MetaItemIcon)`
  width: 23px;
  height: 23px;
`;

const MetaItemText = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin-left: 3px;
`;

export type TProjectCardSize = 'small' | 'medium' | 'large';
export interface InputProps {
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
    const { formatMessage } = useIntl();
    const { data: project } = useProjectById(projectId);
    const { data: authUser } = useAuthUser();
    const { data: projectImages } = useProjectImages(projectId);
    const currentPhaseId =
      project?.data?.relationships?.current_phase?.data?.id ?? null;
    const { data: phase } = usePhase(currentPhaseId);
    const { data: phases } = usePhases(projectId);
    const theme = useTheme();

    const [visible, setVisible] = useState(false);

    const handleIntersection = (
      event: IntersectionObserverEntry,
      unobserve: () => void
    ) => {
      if (event.isIntersecting) {
        setVisible(true);
        unobserve();
      }
    };

    const handleProjectCardOnClick = (projectId: string) => () => {
      trackEventByName(tracks.clickOnProjectCard, { extra: { projectId } });
    };

    const handleCTAOnClick = (projectId: string) => () => {
      trackEventByName(tracks.clickOnProjectCardCTA, { extra: { projectId } });
    };

    const handleProjectTitleOnClick = (projectId: string) => () => {
      trackEventByName(tracks.clickOnProjectTitle, { extra: { projectId } });
    };

    if (project) {
      const methodConfig = getMethodConfig(
        project.data.attributes.participation_method
      );
      const postingPermission = getIdeaPostingRules({
        project: project?.data,
        phase: phase?.data,
        authUser: authUser?.data,
      });
      const participationMethod = phase
        ? phase.data.attributes.participation_method
        : project.data.attributes.participation_method;
      const votingMethod = phase
        ? phase.data.attributes.voting_method
        : project.data.attributes.voting_method;

      const canPost = !!postingPermission.enabled;
      const canReact =
        project.data.attributes.action_descriptor.reacting_idea.enabled;
      const canComment =
        project.data.attributes.action_descriptor.commenting_idea.enabled;

      const imageUrl = !projectImages
        ? null
        : projectImages.data[0]?.attributes.versions?.large;

      const projectUrl = getProjectUrl(project.data);
      const isFinished = project.data.attributes.timeline_active === 'past';
      const isArchived =
        project.data.attributes.publication_status === 'archived';
      const ideasCount = project.data.attributes.ideas_count;
      const commentsCount = project.data.attributes.comments_count;
      const hasAvatars =
        project.data.relationships.avatars &&
        project.data.relationships.avatars.data &&
        project.data.relationships.avatars.data.length > 0;
      const showIdeasCount =
        !(
          project.data.attributes.process_type === 'continuous' &&
          !methodConfig.showInputCount
        ) && ideasCount > 0;
      const showCommentsCount = commentsCount > 0;
      const showFooter = hasAvatars || showIdeasCount || showCommentsCount;
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
      let ctaMessage: JSX.Element | null = null;
      const processType = project.data.attributes.process_type;
      const inputTerm = getInputTerm(processType, project.data, phases?.data);

      if (isArchived) {
        countdown = (
          <ContentHeaderLabel className="e2e-project-card-archived-label">
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
        const totalDays = timeRemaining
          ? moment.duration(moment(endAt).diff(moment(startAt))).asDays()
          : null;
        const pastDays = timeRemaining
          ? moment.duration(moment(moment()).diff(moment(startAt))).asDays()
          : null;
        const progress =
          timeRemaining && isNumber(pastDays) && isNumber(totalDays)
            ? round((pastDays / totalDays) * 100, 1)
            : null;

        countdown =
          typeof progress === 'number' ? (
            <Box mt="4px" className="e2e-project-card-time-remaining">
              <TimeRemaining className={size}>
                <FormattedMessage
                  {...messages.remaining}
                  values={{ timeRemaining }}
                />
              </TimeRemaining>
              <Observer onChange={handleIntersection}>
                <ProgressBar aria-hidden>
                  <ProgressBarOverlay
                    progress={progress}
                    className={visible ? 'visible' : ''}
                  />
                </ProgressBar>
              </Observer>
            </Box>
          ) : null;
      }

      if (participationMethod === 'voting' && votingMethod === 'budgeting') {
        ctaMessage = <FormattedMessage {...messages.allocateYourBudget} />;
      } else if (participationMethod === 'information') {
        ctaMessage = <FormattedMessage {...messages.learnMore} />;
      } else if (
        participationMethod === 'survey' ||
        participationMethod === 'native_survey'
      ) {
        ctaMessage = <FormattedMessage {...messages.takeTheSurvey} />;
      } else if (participationMethod === 'document_annotation') {
        ctaMessage = <FormattedMessage {...messages.reviewDocument} />;
      } else if (participationMethod === 'poll') {
        ctaMessage = <FormattedMessage {...messages.takeThePoll} />;
      } else if (participationMethod === 'ideation' && canPost) {
        ctaMessage = (
          <FormattedMessage
            {...getInputTermMessage(inputTerm, {
              idea: messages.submitYourIdea,
              option: messages.addYourOption,
              project: messages.submitYourProject,
              question: messages.joinDiscussion,
              issue: messages.submitAnIssue,
              contribution: messages.contributeYourInput,
            })}
          />
        );
      } else if (participationMethod === 'ideation' && canReact) {
        ctaMessage = <FormattedMessage {...messages.reaction} />;
      } else if (participationMethod === 'ideation' && canComment) {
        ctaMessage = <FormattedMessage {...messages.comment} />;
      } else if (participationMethod === 'ideation') {
        ctaMessage = (
          <FormattedMessage
            {...getInputTermMessage(inputTerm, {
              idea: messages.viewTheIdeas,
              option: messages.viewTheOptions,
              project: messages.viewTheProjects,
              question: messages.viewTheQuestions,
              issue: messages.viewTheIssues,
              contribution: messages.viewTheContributions,
            })}
          />
        );
      }

      const contentHeader = (
        <ContentHeader
          className={`${size} ${
            !ctaMessage ? 'noRightContent' : 'hasContent hasRightContent'
          } ${!countdown ? 'noLeftContent' : 'hasContent hasLeftContent'} ${
            !ctaMessage && !countdown ? 'noContent' : ''
          }`}
        >
          {countdown !== null && (
            <Box
              className={size}
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

          {ctaMessage !== null && !isFinished && !isArchived && (
            <Box
              minHeight={`${ContentHeaderHeight}px`}
              className={`${size} ${countdown ? 'hasProgressBar' : ''}`}
            >
              <ProjectLabel
                onClick={handleCTAOnClick(project.data.id)}
                className="e2e-project-card-cta"
              >
                {ctaMessage}
              </ProjectLabel>
            </Box>
          )}
        </ContentHeader>
      );

      const screenReaderContent = (
        <ScreenReaderOnly>
          <ProjectTitle>
            <FormattedMessage {...messages.a11y_projectTitle} />
            <T value={project.data.attributes.title_multiloc} />
          </ProjectTitle>

          <ProjectDescription>
            <FormattedMessage {...messages.a11y_projectDescription} />
            <T value={project.data.attributes.description_preview_multiloc} />
          </ProjectDescription>
        </ScreenReaderOnly>
      );

      return (
        <Container
          className={[
            className || '',
            layout,
            size,
            'e2e-project-card',
            'e2e-admin-publication-card',
            isArchived ? 'archived' : '',
            !(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile',
            hideDescriptionPreview ? 'hideDescriptionPreview' : '',
          ]
            .filter((item) => item)
            .join(' ')}
          to={projectUrl}
          onClick={handleProjectCardOnClick(project.data.id)}
        >
          {screenReaderContent}
          {size !== 'large' && contentHeader}

          <ProjectImageContainer className={size}>
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

          <ProjectContent className={size}>
            {size === 'large' && contentHeader}

            <ContentBody className={size} aria-hidden>
              <ProjectTitle
                className="e2e-project-card-project-title"
                onClick={handleProjectTitleOnClick(project.data.id)}
              >
                <T value={project.data.attributes.title_multiloc} />
              </ProjectTitle>

              {!hideDescriptionPreview && (
                <T value={project.data.attributes.description_preview_multiloc}>
                  {(description) => {
                    if (!isEmpty(description)) {
                      return (
                        <ProjectDescription className="e2e-project-card-project-description-preview">
                          {description}
                        </ProjectDescription>
                      );
                    }

                    return null;
                  }}
                </T>
              )}
            </ContentBody>

            {(hasAvatars || showIdeasCount || showCommentsCount) && (
              <Box
                borderTop={`1px solid ${colors.divider}`}
                pt="16px"
                mt="30px"
              >
                <ContentFooter
                  className={`${size} ${!showFooter ? 'hidden' : ''}`}
                >
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

                  <Box h="100%" display="flex" alignItems="center">
                    <ProjectMetaItems>
                      {showIdeasCount && (
                        <MetaItem className="first">
                          <MetaItemIcon ariaHidden name="idea" />
                          <MetaItemText aria-hidden>{ideasCount}</MetaItemText>
                          <ScreenReaderOnly>
                            {formatMessage(
                              getInputTermMessage(inputTerm, {
                                idea: messages.xIdeas,
                                option: messages.xOptions,
                                contribution: messages.xContributions,
                                project: messages.xProjects,
                                issue: messages.xIssues,
                                question: messages.xQuestions,
                              }),
                              { ideasCount }
                            )}
                          </ScreenReaderOnly>
                        </MetaItem>
                      )}

                      {showCommentsCount && (
                        <MetaItem>
                          <CommentIcon ariaHidden name="comments" />
                          <MetaItemText aria-hidden>
                            {commentsCount}
                          </MetaItemText>
                          <ScreenReaderOnly>
                            {formatMessage(messages.xComments, {
                              commentsCount,
                            })}
                          </ScreenReaderOnly>
                        </MetaItem>
                      )}
                    </ProjectMetaItems>
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

export default ProjectCard;
