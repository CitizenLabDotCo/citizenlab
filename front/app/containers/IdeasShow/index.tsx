import React, { lazy, Suspense, useState, useEffect } from 'react';
import { isUndefined, isString, includes } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// services
import { getInputTerm } from 'services/participationContexts';
import { getLatestRelevantPhase } from 'services/phases';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import IdeaSharingButton from './Buttons/IdeaSharingButton';
import IdeaMeta from './IdeaMeta';
import Title from 'components/PostShowComponents/Title';
import IdeaProposedBudget from './IdeaProposedBudget';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Modal from 'components/UI/Modal';
import AssignBudgetControl from 'components/AssignBudgetControl';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import IdeaMoreActions from './IdeaMoreActions';
import { Spinner } from '@citizenlab/cl2-component-library';
import GoBackButton from './GoBackButton';
const LazyComments = lazy(
  () => import('components/PostShowComponents/Comments')
);
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import MetaInformation from './MetaInformation';
import MobileSharingButtonComponent from './Buttons/MobileSharingButtonComponent';
import RightColumnDesktop from './RightColumnDesktop';

// utils
import isFieldEnabled from './isFieldEnabled';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdeaImages, {
  GetIdeaImagesChildProps,
} from 'resources/GetIdeaImages';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetOfficialFeedbacks, {
  GetOfficialFeedbacksChildProps,
} from 'resources/GetOfficialFeedbacks';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import GetIdeaCustomFieldsSchemas, {
  GetIdeaCustomFieldsSchemasChildProps,
} from 'resources/GetIdeaCustomFieldsSchemas';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { getInputTermMessage } from 'utils/i18n';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// utils
import clHistory from 'utils/cl-router/history';

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';
import { columnsGapDesktop, pageContentMaxWidth } from './styleConstants';
import Outlet from 'components/Outlet';
import useLocalize from 'hooks/useLocalize';

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

  &.loaded {
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

const Content = styled.div`
  display: flex;
`;

const LeftColumn = styled.div`
  flex: 1 1 100%;
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

const MobileIdeaMoreActions = styled(IdeaMoreActions)`
  margin-left: 30px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 40px;
`;

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.l}px;
  font-weight: 500;
  line-height: 28px;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
`;

const StyledBody = styled(Body)`
  margin-bottom: 40px;
`;

const StyledIdeaProposedBudget = styled(IdeaProposedBudget)`
  margin-bottom: 20px;
`;

const MobileMetaInformation = styled(MetaInformation)`
  margin-bottom: 30px;
`;

const StyledAssignBudgetControl = styled(AssignBudgetControl)`
  margin-top: 30px;
  margin-bottom: 30px;
`;

const MobileIdeaSharingButton = styled(IdeaSharingButton)``;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
  margin-bottom: 80px;
`;

const Comments = styled.div`
  margin-bottom: 100px;
`;

interface DataProps {
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  ideaImages: GetIdeaImagesChildProps;
  windowSize: GetWindowSizeChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
  ideaCustomFieldsSchemas: GetIdeaCustomFieldsSchemasChildProps;
  comments: GetCommentsChildProps;
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

export const IdeasShow = ({
  locale,
  ideaImages,
  windowSize,
  className,
  postOfficialFeedbackPermission,
  projectId,
  ideaCustomFieldsSchemas,
  insideModal,
  project,
  compact,
  phases,
  idea,
  officialFeedbacks,
  setRef,
  intl: { formatMessage },
}: Props & InjectedIntlProps & WithRouterProps) => {
  const [newIdeaId, setNewIdeaId] = useState<string | null>(null);
  const [spamModalIsVisible, setSpamModalIsVisible] = useState<boolean>(false);
  const [translateButtonIsClicked, setTranslateButtonIsClicked] =
    useState<boolean>(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const newIdeaId = queryParams.get('new_idea_id');
    let timeout: NodeJS.Timeout;
    if (isString(newIdeaId)) {
      timeout = setTimeout(() => {
        setNewIdeaId(newIdeaId);
      }, 1500);
      clHistory.replace(window.location.pathname);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const localize = useLocalize();

  const isLoaded =
    !isNilOrError(idea) &&
    !isUndefined(ideaImages) &&
    !isNilOrError(project) &&
    !isUndefined(officialFeedbacks.officialFeedbacksList);

  const closeIdeaSocialSharingModal = () => {
    setNewIdeaId(null);
  };

  const onTranslateIdea = () => {
    // analytics
    if (translateButtonIsClicked === true) {
      trackEvent(tracks.clickGoBackToOriginalIdeaCopyButton);
    } else if (translateButtonIsClicked === false) {
      trackEvent(tracks.clickTranslateIdeaButton);
    }
    setTranslateButtonIsClicked(!translateButtonIsClicked);
  };

  const handleContainerRef = (element: HTMLDivElement) => {
    setRef?.(element);
  };

  const getLatestRelevantPhaseId = () => {
    if (!isNilOrError(idea) && !isNilOrError(phases)) {
      const ideaPhaseIds = idea?.relationships?.phases?.data?.map(
        (item) => item.id
      );
      const ideaPhases = phases.filter((phase) =>
        includes(ideaPhaseIds, phase.id)
      );
      return getLatestRelevantPhase(ideaPhases)?.id;
    }

    return undefined;
  };

  let content: JSX.Element | null = null;

  if (
    !isNilOrError(project) &&
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !isNilOrError(ideaCustomFieldsSchemas) &&
    isLoaded
  ) {
    // If the user deletes their profile, authorId can be null
    const authorId = idea.relationships?.author?.data?.id || null;
    const titleMultiloc = idea.attributes.title_multiloc;
    const ideaTitle = localize(titleMultiloc);
    const statusId = idea?.relationships?.idea_status?.data?.id;
    const ideaImageLarge = ideaImages?.[0]?.attributes?.versions?.large || null;
    const ideaId = idea.id;
    const proposedBudget = idea.attributes?.proposed_budget;
    const ideaBody = localize(idea?.attributes?.body_multiloc);
    const isCompactView =
      compact === true ||
      (windowSize ? windowSize <= viewportWidths.tablet : false);
    const proposedBudgetEnabled = isFieldEnabled(
      'proposed_budget',
      ideaCustomFieldsSchemas,
      locale
    );

    content = (
      <>
        <IdeaMeta ideaId={ideaId} />

        {!isCompactView && (
          <TopBar>
            <StyledGoBackButton
              projectId={projectId}
              insideModal={insideModal}
            />
            <IdeaMoreActions idea={idea} projectId={projectId} />
          </TopBar>
        )}

        <Content id="e2e-idea-show-page-content">
          <LeftColumn>
            <IdeaHeader>
              <Title
                postType="idea"
                postId={ideaId}
                title={ideaTitle}
                locale={locale}
                translateButtonClicked={translateButtonIsClicked}
              />
              {isCompactView && (
                <MobileIdeaMoreActions idea={idea} projectId={projectId} />
              )}
            </IdeaHeader>

            {ideaImageLarge && (
              <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
            )}

            <Outlet
              id="app.containers.IdeasShow.left"
              idea={idea}
              locale={locale}
              onClick={onTranslateIdea}
              translateButtonClicked={translateButtonIsClicked}
            />

            {proposedBudgetEnabled && proposedBudget && (
              <>
                <BodySectionTitle>
                  <FormattedMessage {...messages.proposedBudgetTitle} />
                </BodySectionTitle>
                <StyledIdeaProposedBudget proposedBudget={proposedBudget} />
                <BodySectionTitle>
                  <FormattedMessage {...messages.bodyTitle} />
                </BodySectionTitle>
              </>
            )}

            <StyledBody
              postType="idea"
              postId={ideaId}
              locale={locale}
              body={ideaBody}
              translateButtonClicked={translateButtonIsClicked}
            />

            {isCompactView && (
              <StyledAssignBudgetControl
                view="ideaPage"
                ideaId={ideaId}
                projectId={projectId}
              />
            )}

            {isCompactView && (
              <MobileMetaInformation
                ideaId={ideaId}
                projectId={projectId}
                statusId={statusId}
                authorId={authorId}
                compact={isCompactView}
              />
            )}

            {isCompactView && (
              <MobileIdeaSharingButton
                ideaId={ideaId}
                buttonComponent={<MobileSharingButtonComponent />}
              />
            )}

            <StyledOfficialFeedback
              postId={ideaId}
              postType="idea"
              permissionToPost={postOfficialFeedbackPermission}
            />

            <Comments>
              <Suspense fallback={<LoadingComments />}>
                <LazyComments postId={ideaId} postType="idea" />
              </Suspense>
            </Comments>
          </LeftColumn>

          {!isCompactView && projectId && (
            <StyledRightColumnDesktop
              ideaId={ideaId}
              projectId={projectId}
              statusId={statusId}
              authorId={authorId}
              insideModal={insideModal}
            />
          )}
        </Content>
      </>
    );
  }

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases
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

        <FeatureFlag name="ideaflow_social_sharing">
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
        </FeatureFlag>
      </>
    );
  }

  return null;
};

const IdeasShowWithHOCs = withRouter(injectIntl(IdeasShow));
const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  windowSize: <GetWindowSize />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => (
    <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>
  ),
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phases: ({ projectId, render }) => (
    <GetPhases projectId={projectId}>{render}</GetPhases>
  ),
  officialFeedbacks: ({ ideaId, render }) => (
    <GetOfficialFeedbacks postId={ideaId} postType="idea">
      {render}
    </GetOfficialFeedbacks>
  ),
  postOfficialFeedbackPermission: ({ project, render }) => (
    <GetPermission
      item={!isNilOrError(project) ? project : null}
      action="moderate"
    >
      {render}
    </GetPermission>
  ),
  ideaCustomFieldsSchemas: ({ projectId, render }) => (
    <GetIdeaCustomFieldsSchemas projectId={projectId}>
      {render}
    </GetIdeaCustomFieldsSchemas>
  ),
  comments: ({ ideaId, render }) => (
    <GetComments postId={ideaId} postType="idea">
      {render}
    </GetComments>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeasShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
