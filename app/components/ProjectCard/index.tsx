import React, { memo, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { isEmpty, get, isNumber, round } from 'lodash-es';
import moment from 'moment';
import Observer from '@researchgate/react-intersection-observer';
import bowser from 'bowser';

// router
import Link from 'utils/cl-router/Link';

// components
import { Icon } from 'cl2-component-library';
import Image from 'components/UI/Image';
import AvatarBubbles from 'components/AvatarBubbles';

// services
import { getProjectUrl } from 'services/projects';
import { getInputTerm } from 'services/participationContexts';
import { getIdeaPostingRules } from 'services/actionTakingRules';

// resources
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import usePhases from 'hooks/usePhases';
import useAuthUser from 'hooks/useAuthUser';
import useProjectImages from 'hooks/useProjectImages';

// i18n
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
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
    min-height: 450px;
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;

    ${isRtl`
        flex-direction: row-reverse;
    `}

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

    &.hideDescriptionPreview {
      min-height: 490px;
    }

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

const ProjectImageContainer = styled.div`
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

const ProjectImagePlaceholder = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.placeholderBg};
`;

const ProjectImagePlaceholderIcon = styled(Icon)`
  height: 45px;
  fill: #fff;
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
    ${media.biggerThanMinTablet`
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

    ${media.smallerThanMinTablet`
      padding-left: 20px;
      padding-right: 20px;
    `}

    ${media.smallPhone`
      padding-left: 10px;
      padding-right: 10px;
    `}
  }
`;

const ContentHeaderLeft = styled.div`
  min-height: ${ContentHeaderHeight}px;
  flex-grow: 0;
  flex-shrink: 1;
  flex-basis: 140px;
  margin-right: 15px;
`;

const ContentHeaderRight = styled.div`
  min-height: ${ContentHeaderHeight}px;
`;

const Countdown = styled.div`
  margin-top: 4px;
`;

const TimeRemaining = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  margin-bottom: 7px;
`;

const ProgressBar = styled.div`
  width: 100%;
  max-width: 130px;
  height: 5px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #d6dade;
`;

const ProgressBarOverlay: any = styled.div`
  width: 0px;
  height: 100%;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.clRed};
  transition: width 1000ms cubic-bezier(0.19, 1, 0.22, 1);
  will-change: width;

  &.visible {
    width: ${(props: any) => props.progress}%;
  }
`;

const ProjectLabel = styled.div`
  // darkened to have higher chances of solid color contrast
  color: ${({ theme }) => darken(0.05, theme.colorSecondary)};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  padding-left: 14px;
  padding-right: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${({ theme }) => rgba(theme.colorSecondary, 0.1)};
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
  color: ${({ theme }) => theme.colorText};
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
  color: ${darken(0.1, colors.label)};
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
  height: 45px;
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: 30px;
  border-top: solid 1px #e0e0e0;

  &.hidden {
    border: none;

    &.large {
      margin-top: 0px;
    }

    &:not(.large) {
      ${media.smallerThanMinTablet`
        height: 20px;
        flex-basis: 20px;
        margin: 0px;
        padding: 0px;
      `}
    }
  }
`;

const ContentFooterSection = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
`;

const ContentFooterLeft = styled(ContentFooterSection)``;

const ContentFooterRight = styled(ContentFooterSection)``;

const ContentHeaderLabel = styled.span`
  height: ${ContentHeaderHeight}px;
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  text-transform: uppercase;
  display: flex;
  align-items: center;
`;

const ProjectMetaItems = styled.div`
  height: 100%;
  color: ${({ theme }) => theme.colorText};
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

  ${media.smallerThanMinTablet`
    margin-left: 20px;
  `};
`;

const MetaItemIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${({ theme }) => theme.colorMain};
`;

const CommentIcon = styled(MetaItemIcon)`
  width: 23px;
  height: 23px;
`;

const MetaItemText = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  margin-left: 3px;
`;

export interface InputProps {
  projectId: string;
  size: 'small' | 'medium' | 'large';
  layout?: 'dynamic' | 'threecolumns' | 'twocolumns';
  hideDescriptionPreview?: boolean;
  className?: string;
}

interface Props extends InputProps, InjectedIntlProps {}

const ProjectCard = memo<Props>(
  ({
    projectId,
    size,
    layout,
    hideDescriptionPreview,
    className,
    intl: { formatMessage },
  }) => {
    const project = useProject({ projectId });
    const authUser = useAuthUser();
    const projectImages = useProjectImages({ projectId });
    const currentPhaseId =
      !isNilOrError(project) && project.relationships.current_phase?.data?.id
        ? project.relationships.current_phase.data.id
        : null;
    const phase = usePhase(currentPhaseId);
    const phases = usePhases(projectId);
    const theme: any = useTheme();

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

    if (!isNilOrError(project)) {
      const postingPermission = getIdeaPostingRules({
        project,
        phase: !isNilOrError(phase) ? phase : null,
        authUser: !isNilOrError(authUser) ? authUser : null,
      });
      const participationMethod = !isNilOrError(phase)
        ? phase.attributes.participation_method
        : project.attributes.participation_method;
      const canPost = !!postingPermission.enabled;
      const canVote = !!(
        (!isNilOrError(phase)
          ? phase.attributes.voting_enabled
          : project.attributes.voting_enabled) &&
        get(project, 'attributes.action_descriptor.voting.enabled')
      );
      const canComment = !!(
        (!isNilOrError(phase)
          ? phase.attributes.commenting_enabled
          : project.attributes.commenting_enabled) &&
        get(project, 'attributes.action_descriptor.commenting_idea.enabled')
      );
      const imageUrl =
        !isNilOrError(projectImages) && projectImages.length > 0
          ? projectImages[0].attributes.versions.medium
          : null;
      const projectUrl = getProjectUrl(project);
      const isFinished = project.attributes.timeline_active === 'past';
      const isArchived = project.attributes.publication_status === 'archived';
      const ideasCount = project.attributes.ideas_count;
      const commentsCount = project.attributes.comments_count;
      const hasAvatars =
        project.relationships.avatars &&
        project.relationships.avatars.data &&
        project.relationships.avatars.data.length > 0;
      const showIdeasCount =
        !(
          project.attributes.process_type === 'continuous' &&
          project.attributes.participation_method !== 'ideation'
        ) && ideasCount > 0;
      const showCommentsCount = commentsCount > 0;
      const showFooter = hasAvatars || showIdeasCount || showCommentsCount;
      const avatarIds =
        project.relationships.avatars && project.relationships.avatars.data
          ? project.relationships.avatars.data.map((avatar) => avatar.id)
          : [];
      const startAt = get(phase, 'attributes.start_at');
      const endAt = get(phase, 'attributes.end_at');
      const timeRemaining = endAt
        ? moment.duration(moment(endAt).endOf('day').diff(moment())).humanize()
        : null;
      let countdown: JSX.Element | null = null;
      let ctaMessage: JSX.Element | null = null;
      const processType = project.attributes.process_type;
      const inputTerm = getInputTerm(processType, project, phases);

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

        countdown = (
          <Countdown className="e2e-project-card-time-remaining">
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
          </Countdown>
        );
      }

      if (participationMethod === 'budgeting') {
        ctaMessage = <FormattedMessage {...messages.allocateYourBudget} />;
      } else if (participationMethod === 'information') {
        ctaMessage = <FormattedMessage {...messages.learnMore} />;
      } else if (participationMethod === 'survey') {
        ctaMessage = <FormattedMessage {...messages.takeTheSurvey} />;
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
      } else if (participationMethod === 'ideation' && canVote) {
        ctaMessage = <FormattedMessage {...messages.vote} />;
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
            <ContentHeaderLeft className={size}>{countdown}</ContentHeaderLeft>
          )}

          {ctaMessage !== null && !isFinished && !isArchived && (
            <ContentHeaderRight
              className={`${size} ${countdown ? 'hasProgressBar' : ''}`}
            >
              <ProjectLabel
                onClick={handleCTAOnClick(project.id)}
                className="e2e-project-card-cta"
              >
                {ctaMessage}
              </ProjectLabel>
            </ContentHeaderRight>
          )}
        </ContentHeader>
      );

      const screenReaderContent = (
        <ScreenReaderOnly>
          <ProjectTitle>
            <FormattedMessage {...messages.a11y_projectTitle} />
            <T value={project.attributes.title_multiloc} />
          </ProjectTitle>

          <ProjectDescription>
            <FormattedMessage {...messages.a11y_projectDescription} />
            <T value={project.attributes.description_preview_multiloc} />
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
          onClick={handleProjectCardOnClick(project.id)}
        >
          {screenReaderContent}
          {size !== 'large' && contentHeader}

          <ProjectImageContainer className={size}>
            <ProjectImagePlaceholder>
              <ProjectImagePlaceholderIcon name="project" />
            </ProjectImagePlaceholder>

            {imageUrl && <ProjectImage src={imageUrl} alt="" cover={true} />}
          </ProjectImageContainer>

          <ProjectContent className={size}>
            {size === 'large' && contentHeader}

            <ContentBody className={size} aria-hidden>
              <ProjectTitle
                className="e2e-project-card-project-title"
                onClick={handleProjectTitleOnClick(project.id)}
              >
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle>

              {!hideDescriptionPreview && (
                <T value={project.attributes.description_preview_multiloc}>
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

            <ContentFooter className={`${size} ${!showFooter ? 'hidden' : ''}`}>
              <ContentFooterLeft>
                {hasAvatars && (
                  <AvatarBubbles
                    size={32}
                    limit={3}
                    userCountBgColor={theme.colorMain}
                    avatarIds={avatarIds}
                    userCount={project.attributes.participants_count}
                  />
                )}
              </ContentFooterLeft>

              <ContentFooterRight>
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
                      <MetaItemText aria-hidden>{commentsCount}</MetaItemText>
                      <ScreenReaderOnly>
                        {formatMessage(messages.xComments, { commentsCount })}
                      </ScreenReaderOnly>
                    </MetaItem>
                  )}
                </ProjectMetaItems>
              </ContentFooterRight>
            </ContentFooter>
          </ProjectContent>
        </Container>
      );
    }

    return null;
  }
);

const ProjectCardWithHoC = injectIntl(ProjectCard);

export default ProjectCardWithHoC;
