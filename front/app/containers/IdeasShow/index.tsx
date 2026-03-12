import React, { lazy, Suspense, useState } from 'react';

import {
  Box,
  Badge,
  Tooltip,
  Divider,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdeaImages from 'api/idea_images/useIdeaImages';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase, getInputTerm } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import ProjectLink from 'containers/EventsShowPage/components/ProjectLink';

import ErrorToast from 'components/ErrorToast';
import FollowUnfollow from 'components/FollowUnfollow';
import Body from 'components/PostShowComponents/Body';
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import FullPageSpinner from 'components/UI/FullPageSpinner';

import { FormattedMessage } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import AuthoringAssistanePrototype from './components/AuthoringAssistanePrototype';
import Container from './components/Container';
import Cosponsorship from './components/Cosponsorship';
import IdeaTitle from './components/IdeaTitle';
import MetaInformation from './components/MetaInformation';
import ProposalInfo from './components/ProposalInfo';
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
  onUnauthenticatedCommentClick?: () => void;
}

export const IdeasShow = ({
  className,
  projectId,
  compact,
  ideaId,
  setRef,
  onUnauthenticatedCommentClick,
}: Props) => {
  const { data: ideaImages, isLoading: isLoadingIdeaImages } =
    useIdeaImages(ideaId);
  const { data: idea, isLoading: isLoadingIdea } = useIdeaById(ideaId);
  const { data: project, isLoading: isLoadingProject } =
    useProjectById(projectId);
  const localize = useLocalize();
  const [translateButtonIsClicked, setTranslateButtonIsClicked] =
    useState(false);
  const postOfficialFeedbackPermission = usePermission({
    item: project?.data || null,
    action: 'moderate',
  });
  const { data: phases } = usePhases(project?.data.id);

  const handleContainerRef = (element: HTMLDivElement) => {
    setRef?.(element);
  };

  if (isLoadingIdea || isLoadingIdeaImages || isLoadingProject) {
    return <FullPageSpinner />;
  }

  if (!idea || !project) {
    return null;
  }

  const authorId = idea.data.relationships.author?.data?.id || null;
  const statusId = idea.data.relationships.idea_status.data?.id;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const ideaImageLarge = ideaImages?.data[0]?.attributes?.versions?.large;
  const participationContext = getCurrentPhase(phases?.data);
  const wasImported = !!idea.data.relationships.idea_import?.data;

  return (
    <Container
      projectId={projectId}
      className={className}
      handleContainerRef={handleContainerRef}
    >
      <Box display="flex" id="e2e-idea-show-page-content">
        <Box flex="1 1 100%" w="100%">
          {wasImported && (
            <Box display="flex">
              <Tooltip
                theme={'dark'}
                content={
                  <Box>
                    <FormattedMessage
                      {...messages.importedTooltip}
                      values={{ inputTerm: getInputTerm(phases?.data) }}
                    />
                  </Box>
                }
              >
                <Box mb="12px">
                  <Badge className="inverse">
                    <FormattedMessage {...messages.imported} />
                  </Badge>
                </Box>
              </Tooltip>
            </Box>
          )}
          <IdeaTitle
            idea={idea}
            projectId={project.data.id}
            translateButtonClicked={translateButtonIsClicked}
          />
          <ProjectLink project={project.data} />
          <AuthoringAssistanePrototype ideaId={idea.data.id} />
          {ideaImageLarge && (
            <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
          )}
          <TranslateButton
            idea={idea}
            translateButtonClicked={translateButtonIsClicked}
            onClick={setTranslateButtonIsClicked}
          />
          <ProposedBudget ideaId={ideaId} projectId={project.data.id} />

          {compact && statusId && (
            <Box my="24px">
              {participationContext?.attributes.participation_method ===
                'proposals' && (
                <>
                  <Divider />
                  <ProposalInfo idea={idea} compact />
                  <Divider />
                </>
              )}
            </Box>
          )}
          <Box mb={compact ? '12px' : '40px'}>
            <Body
              postId={ideaId}
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              body={localize(idea.data.attributes?.body_multiloc)}
              translateButtonClicked={translateButtonIsClicked}
            />
          </Box>
          {compact && <Cosponsorship ideaId={ideaId} />}

          {compact && statusId && (
            <Box my="24px">
              <MetaInformation
                ideaId={ideaId}
                projectId={project.data.id}
                statusId={statusId}
                authorId={authorId}
                compact={compact}
              />
            </Box>
          )}
          <Box my={compact ? '24px' : '80px'}>
            <OfficialFeedback
              postId={ideaId}
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
                onUnauthenticatedCommentClick={onUnauthenticatedCommentClick}
              />
            </Suspense>
          </Box>
          {compact && (
            <Box my="24px">
              <FollowUnfollow
                followableType="ideas"
                followableId={ideaId}
                followersCount={idea.data.attributes.followers_count}
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                followerId={idea.data.relationships.user_follower?.data?.id}
                width="100%"
                toolTipType="input"
              />
            </Box>
          )}
        </Box>
        {!compact && statusId && (
          <StyledRightColumnDesktop
            ideaId={ideaId}
            projectId={project.data.id}
            statusId={statusId}
            authorId={authorId}
          />
        )}
      </Box>
      <ErrorToast />
    </Container>
  );
};

export default IdeasShow;
