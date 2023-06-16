import React, {
  Suspense,
  useState,
  useRef,
  useEffect,
  useCallback,
  lazy,
} from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import Title from 'components/PostShowComponents/Title';
import Image from 'components/PostShowComponents/Image';
import Outlet from 'components/Outlet';
import messages from './messages';
import {
  media,
  useBreakpoint,
  Box,
  Spinner,
} from '@citizenlab/cl2-component-library';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhases from 'api/phases/usePhases';
import { getCurrentParticipationContext } from 'api/phases/utils';
import AssignBudgetControl from 'components/AssignBudgetControl';
import Body from 'components/PostShowComponents/Body';
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import GoBackButtonSolid from 'components/UI/GoBackButton/GoBackButtonSolid';
import IdeasShow from 'containers/IdeasShow';
import IdeaSharingButton from 'containers/IdeasShow/Buttons/IdeaSharingButton';
import MobileSharingButtonComponent from 'containers/IdeasShow/Buttons/MobileSharingButtonComponent';
import IdeaMeta from 'containers/IdeasShow/IdeaMeta';
import IdeaMoreActions from 'containers/IdeasShow/IdeaMoreActions';
import IdeaProposedBudget from 'containers/IdeasShow/IdeaProposedBudget';
import MetaInformation from 'containers/IdeasShow/MetaInformation';
import RightColumnDesktop from 'containers/IdeasShow/RightColumnDesktop';
import {
  pageContentMaxWidth,
  columnsGapDesktop,
} from 'containers/IdeasShow/styleConstants';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { useSearchParams } from 'react-router-dom';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import { Modal } from 'semantic-ui-react';
import { getInputTerm } from 'services/participationContexts';
import { trackEventByName } from 'utils/analytics';
import eventEmitter from 'utils/eventEmitter';
import { getInputTermMessage } from 'utils/i18n';
import { isFieldEnabled } from 'utils/projectUtils';
import { isRtl } from 'utils/styleUtils';
import clHistory from 'utils/cl-router/history';
import tracks from './tracks';
const LazyComments = lazy(
  () => import('components/PostShowComponents/Comments')
);

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Container = styled.main`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  background: #fff;

  &.loading {
    flex: 1;
    justify-content: center;
  }

  &.isLoaded {
    opacity: 0;

    &.content-enter {
      opacity: 0;

      &.content-enter-active {
        opacity: 1;
        transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing}
          ${contentFadeInDelay}ms;
      }
    }

    &.content-enter-done {
      opacity: 1;
    }
  }
`;

const StyledRightColumnDesktop = styled(RightColumnDesktop)`
  margin-left: ${columnsGapDesktop}px;
`;

const IdeaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -5px;
  margin-bottom: 25px;

  ${isRtl`
      flex-direction: row-reverse;
    `}

  ${media.tablet`
      margin-top: 0px;
    `}
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${isRtl`
      flex-direction: row-reverse;
    `}
`;

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.l}px;
  font-weight: 500;
  line-height: 28px;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
`;

interface DataProps {
  project: GetProjectChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
}

interface InputProps {
  ideaId: string;
  projectId: string;
  insideModal: boolean;
  setRef?: (element: HTMLDivElement) => void;
  compact?: boolean;
  className?: string;
}

interface Props extends DataProps, InputProps {}

export const MapOverlayIdeaContent = ({
  className,
  postOfficialFeedbackPermission,
  projectId,
  insideModal,
  project,
  compact,
  ideaId,
  setRef,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: ideaImages } = useIdeaImages(ideaId);

  const [newIdeaId, setNewIdeaId] = useState<string | null>(null);
  const [translateButtonIsClicked, setTranslateButtonIsClicked] =
    useState<boolean>(false);
  const [queryParams] = useSearchParams();
  const ideaIdParameter = queryParams.get('new_idea_id');
  const timeout = useRef<NodeJS.Timeout>();

  const isSmallerThanTablet = useBreakpoint('tablet');

  useEffect(() => {
    if (isString(ideaIdParameter)) {
      timeout.current = setTimeout(() => {
        setNewIdeaId(ideaIdParameter);
      }, 1500);
      clHistory.replace(window.location.pathname);
    }
  }, [ideaIdParameter]);

  const { data: phases } = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const locale = useLocale();

  const ideaflowSocialSharingIsEnabled = useFeatureFlag({
    name: 'ideaflow_social_sharing',
  });

  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    inputId: ideaId,
  });

  const isLoaded =
    !isNilOrError(idea) && !isNilOrError(ideaImages) && !isNilOrError(project);

  const closeIdeaSocialSharingModal = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setNewIdeaId(null);
  };

  const onTranslateIdea = () => {
    // analytics
    if (translateButtonIsClicked === true) {
      trackEventByName(tracks.clickGoBackToOriginalIdeaCopyButton.name);
    } else if (translateButtonIsClicked === false) {
      trackEventByName(tracks.clickTranslateIdeaButton.name);
    }
    setTranslateButtonIsClicked(!translateButtonIsClicked);
  };

  const handleContainerRef = (element: HTMLDivElement) => {
    setRef?.(element);
  };

  let content: JSX.Element | null = null;

  const handleGoBack = useCallback(() => {
    if (insideModal) {
      eventEmitter.emit('closeIdeaModal');
      return;
    }

    if (!project) return;
    clHistory.push(`/projects/${project.attributes.slug}`);
  }, [project, insideModal]);

  if (
    !isNilOrError(project) &&
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !isNilOrError(ideaCustomFieldsSchema) &&
    isLoaded
  ) {
    // If the user deletes their profile, authorId can be null
    const authorId = idea.data.relationships?.author?.data?.id || null;
    const titleMultiloc = idea.data.attributes.title_multiloc;
    const ideaTitle = localize(titleMultiloc);
    const statusId = idea.data.relationships?.idea_status?.data?.id;
    const ideaImageLarge =
      ideaImages?.data[0]?.attributes?.versions?.large || null;
    const ideaId = idea.data.id;
    const proposedBudget = idea.data.attributes?.proposed_budget;
    const ideaBody = localize(idea.data.attributes?.body_multiloc);
    const isCompactView = compact === true || isSmallerThanTablet;

    if (isNilOrError(ideaCustomFieldsSchema)) return null;

    const proposedBudgetEnabled = isFieldEnabled(
      'proposed_budget',
      ideaCustomFieldsSchema.data.attributes,
      locale
    );

    const anonymous = idea.data.attributes.anonymous;
    const participationContext = getCurrentParticipationContext(
      project,
      phases?.data
    );

    content = (
      <>
        <IdeaMeta ideaId={ideaId} />

        {!isCompactView && (
          <TopBar>
            <Box mb="40px">
              <GoBackButtonSolid
                text={localize(project.attributes.title_multiloc)}
                onClick={handleGoBack}
              />
            </Box>
            <IdeaMoreActions idea={idea.data} projectId={projectId} />
          </TopBar>
        )}

        <Box display="flex" id="e2e-idea-show-page-content">
          <Box flex="1 1 100%">
            <IdeaHeader>
              <Title
                postType="idea"
                postId={ideaId}
                title={ideaTitle}
                locale={locale}
                translateButtonClicked={translateButtonIsClicked}
              />
              {isCompactView && (
                <Box ml="30px">
                  {' '}
                  <IdeaMoreActions idea={idea.data} projectId={projectId} />
                </Box>
              )}
            </IdeaHeader>

            {ideaImageLarge && (
              <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
            )}

            <Outlet
              id="app.containers.IdeasShow.left"
              idea={idea.data}
              locale={locale}
              onClick={onTranslateIdea}
              translateButtonClicked={translateButtonIsClicked}
            />

            {proposedBudgetEnabled && proposedBudget && (
              <>
                <BodySectionTitle>
                  <FormattedMessage {...messages.proposedBudgetTitle} />
                </BodySectionTitle>
                <Box mb="20px">
                  <IdeaProposedBudget proposedBudget={proposedBudget} />
                </Box>
                <BodySectionTitle>
                  <FormattedMessage {...messages.bodyTitle} />
                </BodySectionTitle>
              </>
            )}

            <Box mb="40px">
              <Body
                postType="idea"
                postId={ideaId}
                locale={locale}
                body={ideaBody}
                translateButtonClicked={translateButtonIsClicked}
              />
            </Box>
            {isCompactView && (
              <Box my="30px">
                {' '}
                <AssignBudgetControl
                  view="ideaPage"
                  ideaId={ideaId}
                  projectId={projectId}
                />
              </Box>
            )}

            {isCompactView && (
              <Box mb="30px">
                {' '}
                <MetaInformation
                  ideaId={ideaId}
                  projectId={projectId}
                  statusId={statusId}
                  authorId={authorId}
                  compact={isCompactView}
                  anonymous={anonymous}
                />
              </Box>
            )}

            {isCompactView && (
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
                    participationContext?.attributes
                      .allow_anonymous_participation
                  }
                  postId={ideaId}
                  postType="idea"
                />
              </Suspense>
            </Box>
          </Box>

          {!isCompactView && projectId && (
            <StyledRightColumnDesktop
              ideaId={ideaId}
              projectId={projectId}
              statusId={statusId}
              authorId={authorId}
              insideModal={insideModal}
              anonymous={anonymous}
            />
          )}
        </Box>
      </>
    );
  }

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases?.data
    );

    return (
      <>
        {!isLoaded && (
          <Container className={`loading ${className || ''}`}>
            <Spinner />
          </Container>
        )}
        <CSSTransition
          classNames="content"
          in={isLoaded}
          timeout={{
            enter: contentFadeInDuration + contentFadeInDelay,
            exit: 0,
          }}
          enter={true}
          exit={false}
        >
          <Container
            id="e2e-idea-show"
            className={`loaded ${className || ''}`}
            ref={handleContainerRef}
          >
            {content}
          </Container>
        </CSSTransition>
        {ideaflowSocialSharingIsEnabled && (
          <Modal
            opened={!!newIdeaId}
            close={closeIdeaSocialSharingModal}
            hasSkipButton={true}
            skipText={<FormattedMessage {...messages.skipSharing} />}
          >
            {newIdeaId && (
              <SharingModalContent
                postType="idea"
                postId={newIdeaId}
                title={formatMessage(
                  getInputTermMessage(inputTerm, {
                    idea: messages.sharingModalTitle,
                    option: messages.optionSharingModalTitle,
                    project: messages.projectSharingModalTitle,
                    question: messages.questionSharingModalTitle,
                    issue: messages.issueSharingModalTitle,
                    contribution: messages.contributionSharingModalTitle,
                  })
                )}
                subtitle={formatMessage(messages.sharingModalSubtitle)}
              />
            )}
          </Modal>
        )}
      </>
    );
  }

  return null;
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
