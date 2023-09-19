import React, { lazy, Suspense, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Container from './components/Container';
import IdeaSharingButton from './components/Buttons/IdeaSharingButton';
import IdeaMeta from './components/IdeaMeta';
import DesktopTopBar from './components/DesktopTopBar';
import IdeaTitle from './components/IdeaTitle';
import ProposedBudget from './components/ProposedBudget';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import TranslateButton from './components/TranslateButton';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import { Box } from '@citizenlab/cl2-component-library';
const LazyComments = lazy(
  () => import('components/PostShowComponents/Comments')
);
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import MetaInformation from './components/MetaInformation';
import MobileSharingButtonComponent from './components/Buttons/MobileSharingButtonComponent';
import RightColumnDesktop from './components/RightColumnDesktop';
import ErrorToast from 'components/ErrorToast';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';

// i18n
import useLocalize from 'hooks/useLocalize';

// style
import styled from 'styled-components';
import { columnsGapDesktop } from './styleConstants';

// hooks
import usePhases from 'api/phases/usePhases';
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaImages from 'api/idea_images/useIdeaImages';

// types
import { IIdea } from 'api/ideas/types';
import { IProjectData } from 'api/projects/types';
import { IIdeaImages } from 'api/idea_images/types';

// utils
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import {
  getCurrentParticipationContext,
  isIdeaInParticipationContext,
} from 'api/phases/utils';

const StyledRightColumnDesktop = styled(RightColumnDesktop)`
  margin-left: ${columnsGapDesktop}px;
`;

interface DataProps {
  project: GetProjectChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
}

interface InputProps {
  ideaId: string;
  projectId: string;
  setRef?: (element: HTMLDivElement) => void;
  compact: boolean;
  className?: string;
}

interface Props extends DataProps, InputProps {}

export const IdeasShow = ({
  className,
  postOfficialFeedbackPermission,
  projectId,
  project,
  compact,
  ideaId,
  setRef,
}: Props) => {
  const { data: ideaImages } = useIdeaImages(ideaId);
  const { data: idea } = useIdeaById(ideaId);

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
          project={project}
          ideaImages={ideaImages}
          compact={compact}
        />
      )}
    </Container>
  );
};

interface ContentProps {
  postOfficialFeedbackPermission: GetPermissionChildProps;
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

  const participationContext = getCurrentParticipationContext(
    project,
    phases?.data
  );

  const votingMethodConfig = getVotingMethodConfig(
    participationContext?.attributes.voting_method
  );

  const ideaIsInParticipationContext = participationContext
    ? isIdeaInParticipationContext(idea, participationContext)
    : undefined;

  return (
    <>
      <IdeaMeta ideaId={ideaId} />

      {!compact && <DesktopTopBar project={project} idea={idea.data} />}

      <Box display="flex" id="e2e-idea-show-page-content">
        <Box flex="1 1 100%">
          <IdeaTitle
            idea={idea}
            projectId={project.id}
            translateButtonClicked={translateButtonIsClicked}
            showActions={compact}
          />

          {ideaImageLarge && (
            <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
          )}

          <TranslateButton
            idea={idea}
            translateButtonClicked={translateButtonIsClicked}
            onClick={setTranslateButtonIsClicked}
          />

          <ProposedBudget ideaId={ideaId} projectId={project.id} />

          <Box mb="40px">
            <Body
              postType="idea"
              postId={ideaId}
              body={ideaBody}
              translateButtonClicked={translateButtonIsClicked}
            />
          </Box>
          {compact && participationContext && ideaIsInParticipationContext && (
            <Box mb="16px">
              {votingMethodConfig?.getIdeaPageVoteInput({
                ideaId,
                compact: true,
                participationContext,
              })}
            </Box>
          )}
          {compact &&
            participationContext?.attributes.participation_method !==
              'voting' && (
              <Box mb="30px">
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
          {compact && (
            <IdeaSharingButton
              ideaId={ideaId}
              buttonComponent={<MobileSharingButtonComponent />}
            />
          )}
          <Box my="80px">
            <OfficialFeedback
              postId={ideaId}
              postType="idea"
              permissionToPost={postOfficialFeedbackPermission}
            />
          </Box>
          <Box mb="100px">
            <Suspense fallback={<LoadingComments />}>
              <LazyComments
                allowAnonymousParticipation={
                  participationContext?.attributes.allow_anonymous_participation
                }
                postId={ideaId}
                postType="idea"
              />
            </Suspense>
          </Box>
        </Box>

        {!compact && (
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

const Data = adopt<DataProps, InputProps>({
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  postOfficialFeedbackPermission: ({ project, render }) => (
    <GetPermission
      item={!isNilOrError(project) ? project : null}
      action="moderate"
    >
      {render}
    </GetPermission>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeasShow {...inputProps} {...dataProps} />}
  </Data>
);
