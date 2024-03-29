import React, { lazy, Suspense, useState } from 'react';

import { Box, Badge } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';

import { IIdeaImages } from 'api/idea_images/types';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import { IIdea } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getInputTerm } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import ProjectLink from 'containers/EventsShowPage/components/ProjectLink';

import ErrorToast from 'components/ErrorToast';
import FollowUnfollow from 'components/FollowUnfollow';
import Body from 'components/PostShowComponents/Body';
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';

import Container from './components/Container';
import DesktopTopBar from './components/DesktopTopBar';
import IdeaMeta from './components/IdeaMeta';
import IdeaTitle from './components/IdeaTitle';
import MetaInformation from './components/MetaInformation';
import ProposedBudget from './components/ProposedBudget';
import RightColumnDesktop from './components/RightColumnDesktop';
import TranslateButton from './components/TranslateButton';
import messages from './messages';
import { columnsGapDesktop } from './styleConstants';

const LazyCommentsSection = lazy(
  () => import('components/PostShowComponents/Comments/CommentsSection')
);

const StyledRightColumnDesktop = styled(RightColumnDesktop)`
  margin-left: ${columnsGapDesktop}px;
`;

interface Props {
  ideaId: string;
  projectId: string;
  setRef?: (element: HTMLDivElement) => void;
  compact: boolean;
  className?: string;
}

export const IdeasShow = ({
  className,
  projectId,
  compact,
  ideaId,
  setRef,
}: Props) => {
  const { data: ideaImages } = useIdeaImages(ideaId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const postOfficialFeedbackPermission = usePermission({
    item: !isNilOrError(project) ? project.data : null,
    action: 'moderate',
  });

  const isLoaded = !!(idea && ideaImages && project);

  const handleContainerRef = (element: HTMLDivElement) => {
    setRef?.(element);
  };

  return (
    <Container
      projectId={projectId}
      isLoaded={isLoaded}
      className={className}
      handleContainerRef={handleContainerRef}
    >
      {isLoaded && (
        <Content
          postOfficialFeedbackPermission={postOfficialFeedbackPermission}
          idea={idea}
          project={project.data}
          ideaImages={ideaImages}
          compact={compact}
        />
      )}
    </Container>
  );
};

interface ContentProps {
  postOfficialFeedbackPermission: boolean;
  idea: IIdea;
  project: IProjectData;
  ideaImages: IIdeaImages;
  compact: boolean;
}

const Content = ({
  postOfficialFeedbackPermission,
  idea,
  project,
  ideaImages,
  compact,
}: ContentProps) => {
  const { data: phases } = usePhases(project.id);
  const localize = useLocalize();
  const [translateButtonIsClicked, setTranslateButtonIsClicked] =
    useState(false);

  const authorId = idea.data.relationships?.author?.data?.id || null;
  const statusId = idea.data.relationships?.idea_status?.data?.id;
  const ideaImageLarge =
    ideaImages?.data[0]?.attributes?.versions?.large || null;
  const ideaId = idea.data.id;
  const ideaBody = localize(idea.data.attributes?.body_multiloc);

  const participationContext = getCurrentPhase(phases?.data);

  const inputTerm = getInputTerm(phases?.data);

  const wasImported = !!idea.data.relationships.idea_import?.data;

  return (
    <>
      <IdeaMeta ideaId={ideaId} />

      {!compact && <DesktopTopBar project={project} idea={idea.data} />}

      <Box display="flex" id="e2e-idea-show-page-content">
        <Box flex="1 1 100%">
          {wasImported && (
            <Box display="flex">
              <Tippy
                interactive={true}
                theme={'dark'}
                content={
                  <Box>
                    <FormattedMessage
                      {...messages.importedTooltip}
                      values={{ inputTerm }}
                    />
                  </Box>
                }
              >
                <Box mb="12px">
                  <Badge className="inverse">
                    <FormattedMessage {...messages.imported} />
                  </Badge>
                </Box>
              </Tippy>
            </Box>
          )}
          <IdeaTitle
            idea={idea}
            projectId={project.id}
            translateButtonClicked={translateButtonIsClicked}
            showActions={compact}
          />
          <ProjectLink project={project} />

          {ideaImageLarge && (
            <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
          )}

          <TranslateButton
            idea={idea}
            translateButtonClicked={translateButtonIsClicked}
            onClick={setTranslateButtonIsClicked}
          />

          <ProposedBudget ideaId={ideaId} projectId={project.id} />

          <Box mb={compact ? '12px' : '40px'}>
            <Body
              postType="idea"
              postId={ideaId}
              body={ideaBody}
              translateButtonClicked={translateButtonIsClicked}
            />
          </Box>
          {compact &&
            participationContext?.attributes.participation_method !==
              'voting' && // To reduce bias we want to hide the author data during voting methods
            statusId && (
              <Box my="24px">
                {' '}
                <MetaInformation
                  ideaId={ideaId}
                  projectId={project.id}
                  statusId={statusId}
                  authorId={authorId}
                  compact={compact}
                />
              </Box>
            )}
          <Box my={compact ? '24px' : '80px'}>
            <OfficialFeedback
              postId={ideaId}
              postType="idea"
              permissionToPost={postOfficialFeedbackPermission}
            />
          </Box>
          <Box mb={compact ? '32px' : '100px'}>
            <Suspense fallback={<LoadingComments />}>
              <LazyCommentsSection
                allowAnonymousParticipation={
                  participationContext?.attributes.allow_anonymous_participation
                }
                postId={ideaId}
                postType="idea"
              />
            </Suspense>
          </Box>
          {compact && (
            <Box my="24px">
              <FollowUnfollow
                followableType="ideas"
                followableId={ideaId}
                followersCount={idea.data.attributes.followers_count}
                followerId={idea.data.relationships.user_follower?.data?.id}
                width="100%"
              />
            </Box>
          )}
        </Box>

        {!compact && statusId && (
          <StyledRightColumnDesktop
            ideaId={ideaId}
            projectId={project.id}
            statusId={statusId}
            authorId={authorId}
          />
        )}
      </Box>
      <ErrorToast />
    </>
  );
};

export default IdeasShow;
