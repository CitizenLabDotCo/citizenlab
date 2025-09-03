import React, { memo, useState } from 'react';

import {
  Box,
  media,
  colors,
  fontSizes,
  defaultCardStyle,
  defaultCardHoverStyle,
  isRtl,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import { isEmpty, round } from 'lodash-es';
import moment from 'moment';
import { rgba, darken } from 'polished';
import { useInView } from 'react-intersection-observer';
import { RouteType } from 'routes';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import useProjectImage from 'api/project_images/useProjectImage';
import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import useProjectById from 'api/projects/useProjectById';
import { getProjectUrl } from 'api/projects/utils';
import useReport from 'api/reports/useReport';

import useLocalize from 'hooks/useLocalize';

import AvatarBubbles from 'components/AvatarBubbles';
import PhaseTimeLeft from 'components/PhaseTimeLeft';
import { TLayout } from 'components/ProjectAndFolderCards';
import T from 'components/T';
import Image from 'components/UI/Image';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import getCTAMessage from './getCTAMessage';
import ImagePlaceholder from './ImagePlaceholder';
import messages from './messages';
import tracks from './tracks';

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

const ProjectLabel = styled.button`
  color: ${({ theme }) => darken(0.05, theme.colors.tenantSecondary)};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  padding: 8px 14px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: 1px solid ${({ theme }) => darken(0.05, theme.colors.tenantSecondary)};
  background: transparent;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => rgba(theme.colors.tenantSecondary, 0.1)};
    color: ${({ theme }) => theme.colors.tenantSecondary};
    border-color: ${({ theme }) => theme.colors.tenantSecondary};
    cursor: pointer;
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

export type TProjectCardSize = 'small' | 'medium' | 'large';
export interface InputProps {
  projectId: string;
  size: TProjectCardSize;
  layout?: TLayout;
  hideDescriptionPreview?: boolean;
  className?: string;
}

const ProjectCard = memo<InputProps>(
  ({ projectId, size, layout, hideDescriptionPreview, className }) => {
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
    const currentPhaseId =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      project?.data?.relationships?.current_phase?.data?.id ?? null;
    const { data: phase } = usePhase(currentPhaseId);
    const { data: report } = useReport(
      phase?.data.relationships.report?.data?.id
    );
    const hasPublicReport = !!report?.data.attributes.visible;

    const projectImage = imageId ? _projectImage : undefined;

    const localize = useLocalize();
    const { formatMessage } = useIntl();

    const [visible, setVisible] = useState(false);

    const handleProjectCardOnClick = (projectId: string) => {
      trackEventByName(tracks.clickOnProjectCard, { projectId });
    };

    const handleCTAOnClick = (projectId: string) => {
      trackEventByName(tracks.clickOnProjectCardCTA, { projectId });
    };

    const handleProjectTitleOnClick = (projectId: string) => {
      trackEventByName(tracks.clickOnProjectTitle, { projectId });
    };

    if (!project) return null;

    const imageUrl = !projectImage
      ? null
      : projectImage.data.attributes.versions.large;
    const projectImageAltText = localize(
      projectImage?.data.attributes.alt_text_multiloc
    );

    const projectUrl: RouteType = getProjectUrl(project.data.attributes.slug);
    const isFinished = project.data.attributes.timeline_active === 'past';
    const isArchived =
      project.data.attributes.publication_status === 'archived';
    const showAvatarBubbles = project.data.attributes.participants_count > 0;
    const avatarIds =
      project.data.relationships.avatars &&
      project.data.relationships.avatars.data
        ? project.data.relationships.avatars.data.map((avatar) => avatar.id)
        : [];
    const startAt = phase?.data.attributes.start_at;
    const endAt = phase?.data.attributes.end_at;

    let countdown: JSX.Element | null = null;

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
    } else if (endAt) {
      const totalDays = moment
        .duration(moment(endAt).diff(moment(startAt)))
        .asDays();
      const pastDays = moment
        .duration(moment(moment()).diff(moment(startAt)))
        .asDays();
      const progress =
        // number between 0 and 100
        round((pastDays / totalDays) * 100, 1);
      countdown = (
        <Box mt="4px" className="e2e-project-card-time-remaining">
          <Text color="textPrimary" fontSize="s" m="0">
            <PhaseTimeLeft currentPhaseEndsAt={endAt} />
          </Text>
          <ProgressBar ref={progressBarRef} aria-hidden>
            <ProgressBarOverlay
              progress={progress}
              className={visible ? 'visible' : ''}
            />
          </ProgressBar>
        </Box>
      );
    }

    const ctaMessage = phase
      ? getCTAMessage({
          actionDescriptors: project.data.attributes.action_descriptors,
          phase: phase.data,
          formatMessage,
          localize,
          hasPublicReport,
        })
      : undefined;

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

        {ctaMessage && !isFinished && !isArchived && (
          <Box
            minHeight={`${ContentHeaderHeight}px`}
            className={`${size} ${countdown ? 'hasProgressBar' : ''}`}
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

    const screenReaderContent = (
      <ScreenReaderOnly>
        <ProjectTitle variant="h3">
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
          hideDescriptionPreview ? 'hideDescriptionPreview' : '',
        ]
          .filter((item) => item)
          .join(' ')}
        to={projectUrl}
        scrollToTop
        onClick={() => {
          handleProjectCardOnClick(project.data.id);
        }}
        data-cy="e2e-project-card"
      >
        {screenReaderContent}
        {size !== 'large' && contentHeader}

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

        <ProjectContent className={size}>
          {size === 'large' && contentHeader}

          <ContentBody className={size} aria-hidden>
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
          </ContentBody>

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
        </ProjectContent>
      </Container>
    );
  }
);

export default ProjectCard;
