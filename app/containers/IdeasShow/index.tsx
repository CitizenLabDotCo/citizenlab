import React, { PureComponent, lazy, Suspense } from 'react';
import { sortBy, last, isUndefined, isString } from 'lodash-es';
import { isNilOrError, getFormattedBudget } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// services
import { getInputTerm } from 'services/participationContexts';

// typings
import { IParticipationContextType } from 'typings';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import IdeaSharingButton from './Buttons/IdeaSharingButton';
import IdeaMeta from './IdeaMeta';
import Title from 'components/PostShowComponents/Title';
import IdeaProposedBudget from './IdeaProposedBudget';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Modal from 'components/UI/Modal';
import AssignBudgetWrapper from './CTABox/ParticipatoryBudgetingCTABox/BudgetAssignment/AssignBudgetWrapper';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import IdeaMoreActions from './IdeaMoreActions';
import { Spinner } from 'cl2-component-library';
import GoBackButton from './GoBackButton';
import TranslateButton from 'components/UI/TranslateButton';
const LazyComments = lazy(() =>
  import('components/PostShowComponents/Comments')
);
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import MetaInformation from './MetaInformation';
import MobileSharingButtonComponent from './Buttons/MobileSharingButtonComponent';
import RightColumnDesktop from './RightColumnDesktop';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
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
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
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

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';
import {
  columnsGapDesktop,
  columnsGapTablet,
  pageContentMaxWidth,
} from './styleConstants';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Loading = styled.div`
  width: 100vw;
  height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.smallerThanMaxTablet`
    height: calc(100vh - ${({ theme: { mobileTopBarHeight } }) =>
      mobileTopBarHeight}px);
  `}

  ${media.smallerThanMinTablet`
    height: calc(100vh - ${({ theme: { mobileTopBarHeight } }) =>
      mobileTopBarHeight}px);
  `}
`;

const Container = styled.main`
  display: flex;
  flex-direction: column;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  background: #fff;
  opacity: 0;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${({
      theme: { mobileMenuHeight, mobileTopBarHeight },
    }) => mobileMenuHeight + mobileTopBarHeight}px);
  `}

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
`;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 40px;
  padding-left: 60px;
  padding-right: 60px;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-top: 35px;
  `}

  ${media.smallerThanMinTablet`
    padding-top: 25px;
    padding-left: 15px;
    padding-right: 15px;
  `}
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const LeftColumn = styled.div`
  flex: 2;
  margin: 0;
  padding: 0;
  padding-right: ${columnsGapDesktop}px;

  ${media.tablet`
    padding-right: ${columnsGapTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const StyledTranslateButton = styled(TranslateButton)`
  margin-bottom: 20px;
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

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    margin-bottom: 25px;
  `}
`;

const StyledIdeaMoreActions = styled(IdeaMoreActions)`
  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MobileIdeaMoreActions = styled(IdeaMoreActions)`
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledGoBackButton = styled(GoBackButton)`
  margin-bottom: 40px;
  display: block;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.large}px;
  font-weight: 500;
  line-height: 28px;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
`;

const StyledBody = styled(Body)`
  margin-bottom: 40px;

  ${media.smallerThanMaxTablet`
  margin-bottom: 25px;
  `}
`;

const StyledIdeaProposedBudget = styled(IdeaProposedBudget)`
  margin-bottom: 20px;
`;

const MobileMetaInformation = styled(MetaInformation)`
  margin-bottom: 30px;
`;

const AssignBudgetControlMobile = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const MobileIdeaSharingButton = styled(IdeaSharingButton)`
  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

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
  tenant: GetAppConfigurationChildProps;
  comments: GetCommentsChildProps;
}

interface InputProps {
  ideaId: string;
  projectId: string;
  insideModal: boolean;
  className?: string;
}

interface Props extends DataProps, InputProps {}

interface IActionInfos {
  participationContextType: IParticipationContextType | null;
  participationContextId: string | null;
  budgetingDescriptor: any | null;
  showBudgetControl: boolean | null;
  showVoteControl: boolean | null;
}

interface State {
  loaded: boolean;
  spamModalVisible: boolean;
  ideaIdForSocialSharing: string | null;
  translateButtonClicked: boolean;
  actionInfos: IActionInfos | null;
}

export class IdeasShow extends PureComponent<
  Props & InjectedIntlProps & InjectedLocalized & WithRouterProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      spamModalVisible: false,
      ideaIdForSocialSharing: null,
      translateButtonClicked: false,
      actionInfos: null,
    };
  }

  componentDidMount() {
    const newIdeaId = this.props.location.query?.['new_idea_id'];

    this.setLoaded();

    if (isString(newIdeaId)) {
      setTimeout(() => {
        this.setState({ ideaIdForSocialSharing: newIdeaId });
      }, 1500);

      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  componentDidUpdate() {
    this.setLoaded();
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    const { actionInfos } = prevState;
    const { idea, project, phases, authUser } = nextProps;
    let stateToUpdate: Partial<State> | null = null;

    if (
      !actionInfos &&
      !isNilOrError(idea) &&
      !isNilOrError(project) &&
      !isUndefined(phases)
    ) {
      const upvotesCount = idea.attributes.upvotes_count;
      const downvotesCount = idea.attributes.downvotes_count;
      const votingEnabled =
        idea.attributes.action_descriptor.voting_idea.enabled;
      const votingDisabledReason =
        idea.attributes.action_descriptor.voting_idea.disabled_reason;
      const cancellingEnabled =
        idea.attributes.action_descriptor.voting_idea.cancelling_enabled;
      const votingFutureEnabled =
        idea.attributes.action_descriptor.voting_idea.future_enabled;
      const pbProject =
        project.attributes.process_type === 'continuous' &&
        project.attributes.participation_method === 'budgeting'
          ? project
          : null;
      const pbPhase =
        !pbProject && !isNilOrError(phases)
          ? phases.find(
              (phase) => phase.attributes.participation_method === 'budgeting'
            )
          : null;
      const pbPhaseIsActive =
        pbPhase &&
        pastPresentOrFuture([
          pbPhase.attributes.start_at,
          pbPhase.attributes.end_at,
        ]) === 'present';
      const lastPhase = !isNilOrError(phases)
        ? last(sortBy(phases, [(phase) => phase.attributes.end_at]))
        : null;
      const lastPhaseHasPassed = lastPhase
        ? pastPresentOrFuture([
            lastPhase.attributes.start_at,
            lastPhase.attributes.end_at,
          ]) === 'past'
        : false;
      const pbPhaseIsLast = pbPhase && lastPhase && lastPhase.id === pbPhase.id;
      const showBudgetControl = !!(
        pbProject ||
        (pbPhase && (pbPhaseIsActive || (lastPhaseHasPassed && pbPhaseIsLast)))
      );
      const isSignedIn = !isNilOrError(authUser);
      const shouldVerify =
        !votingEnabled && votingDisabledReason === 'not_verified' && isSignedIn;
      const verifiedButNotPermitted =
        !shouldVerify && votingDisabledReason === 'not_permitted';
      const shouldSignIn =
        !votingEnabled &&
        (votingDisabledReason === 'not_signed_in' ||
          (votingDisabledReason === 'not_verified' && !isSignedIn));
      const showVoteControl = !!(
        !showBudgetControl &&
        (votingEnabled ||
          cancellingEnabled ||
          votingFutureEnabled ||
          upvotesCount > 0 ||
          downvotesCount > 0 ||
          shouldVerify ||
          shouldSignIn ||
          verifiedButNotPermitted)
      );
      const budgetingDescriptor =
        idea?.attributes?.action_descriptor?.budgeting || null;
      let participationContextType: IParticipationContextType | null = null;
      let participationContextId: string | null = null;

      if (pbProject) {
        participationContextType = 'project';
      } else if (pbPhase) {
        participationContextType = 'phase';
      }

      if (!isNilOrError(pbProject)) {
        participationContextId = pbProject.id;
      } else if (!isNilOrError(pbPhase)) {
        participationContextId = pbPhase.id;
      }

      stateToUpdate = {
        ...(stateToUpdate || {}),
        actionInfos: {
          participationContextType,
          participationContextId,
          budgetingDescriptor,
          showBudgetControl,
          showVoteControl,
        },
      };
    }

    return stateToUpdate;
  }

  setLoaded = () => {
    const { loaded } = this.state;
    const { idea, ideaImages, project, officialFeedbacks } = this.props;

    if (
      !loaded &&
      !isNilOrError(idea) &&
      !isUndefined(ideaImages) &&
      !isNilOrError(project) &&
      !isUndefined(officialFeedbacks.officialFeedbacksList)
    ) {
      this.setState({ loaded: true });
    }
  };

  closeIdeaSocialSharingModal = () => {
    this.setState({ ideaIdForSocialSharing: null });
  };

  onTranslateIdea = () => {
    this.setState((prevState) => {
      // analytics
      if (prevState.translateButtonClicked === true) {
        trackEvent(tracks.clickGoBackToOriginalIdeaCopyButton);
      } else if (prevState.translateButtonClicked === false) {
        trackEvent(tracks.clickTranslateIdeaButton);
      }

      return {
        translateButtonClicked: !prevState.translateButtonClicked,
      };
    });
  };

  render() {
    const {
      locale,
      idea,
      localize,
      ideaImages,
      windowSize,
      className,
      postOfficialFeedbackPermission,
      projectId,
      ideaCustomFieldsSchemas,
      tenant,
      insideModal,
      project,
      phases,
    } = this.props;
    const {
      loaded,
      ideaIdForSocialSharing,
      translateButtonClicked,
      actionInfos,
    } = this.state;
    const { formatMessage } = this.props.intl;
    let content: JSX.Element | null = null;

    if (
      !isNilOrError(idea) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(ideaCustomFieldsSchemas) &&
      loaded
    ) {
      // If the user deletes their profile, authorId can be null
      const authorId = idea.relationships?.author?.data?.id || null;
      const titleMultiloc = idea.attributes.title_multiloc;
      const ideaTitle = localize(titleMultiloc);
      const statusId = idea?.relationships?.idea_status?.data?.id;
      const ideaImageLarge =
        ideaImages?.[0]?.attributes?.versions?.large || null;
      const ideaId = idea.id;
      const proposedBudget = idea.attributes?.proposed_budget;
      const ideaBody = localize(idea?.attributes?.body_multiloc);
      const participationContextType =
        actionInfos?.participationContextType || null;
      const participationContextId =
        actionInfos?.participationContextId || null;
      const budgetingDescriptor = actionInfos?.budgetingDescriptor || null;
      const showBudgetControl = actionInfos?.showBudgetControl || null;
      const showVoteControl = actionInfos?.showVoteControl || null;
      const biggerThanLargeTablet = windowSize
        ? windowSize > viewportWidths.largeTablet
        : false;
      const smallerThanLargeTablet = windowSize
        ? windowSize <= viewportWidths.largeTablet
        : false;
      const proposedBudgetEnabled = isFieldEnabled(
        'proposed_budget',
        ideaCustomFieldsSchemas,
        locale
      );

      const showTranslateButton =
        !isNilOrError(idea) &&
        !isNilOrError(locale) &&
        !idea.attributes.title_multiloc[locale];

      content = (
        <>
          <IdeaMeta ideaId={ideaId} />

          <IdeaContainer>
            <TopBar>
              <StyledGoBackButton
                projectId={projectId}
                insideModal={insideModal}
              />
              <StyledIdeaMoreActions
                idea={idea}
                hasLeftMargin={true}
                projectId={projectId}
              />
            </TopBar>

            <Content id="e2e-idea-show-page-content">
              <LeftColumn>
                <IdeaHeader>
                  <Title
                    postType="idea"
                    postId={ideaId}
                    title={ideaTitle}
                    locale={locale}
                    translateButtonClicked={translateButtonClicked}
                  />
                  <MobileIdeaMoreActions
                    idea={idea}
                    hasLeftMargin={true}
                    projectId={projectId}
                  />
                </IdeaHeader>

                {ideaImageLarge && (
                  <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
                )}

                <FeatureFlag name="machine_translations">
                  {showTranslateButton && (
                    <StyledTranslateButton
                      translateButtonClicked={translateButtonClicked}
                      onClick={this.onTranslateIdea}
                    />
                  )}
                </FeatureFlag>

                {proposedBudgetEnabled && proposedBudget && (
                  <>
                    <BodySectionTitle>
                      <FormattedMessage {...messages.proposedBudgetTitle} />
                    </BodySectionTitle>
                    <StyledIdeaProposedBudget
                      formattedBudget={getFormattedBudget(
                        locale,
                        proposedBudget,
                        tenant.attributes.settings.core.currency
                      )}
                    />
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
                  translateButtonClicked={translateButtonClicked}
                />

                {smallerThanLargeTablet && (
                  <MobileMetaInformation
                    ideaId={ideaId}
                    projectId={projectId}
                    statusId={statusId}
                    authorId={authorId}
                  />
                )}

                {showBudgetControl &&
                  participationContextId &&
                  participationContextType &&
                  budgetingDescriptor &&
                  smallerThanLargeTablet && (
                    <AssignBudgetControlMobile>
                      <AssignBudgetWrapper
                        ideaId={ideaId}
                        projectId={projectId}
                        participationContextId={participationContextId}
                        participationContextType={participationContextType}
                        budgetingDescriptor={budgetingDescriptor}
                      />
                    </AssignBudgetControlMobile>
                  )}

                <MobileIdeaSharingButton
                  ideaId={ideaId}
                  buttonComponent={<MobileSharingButtonComponent />}
                />

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

              {biggerThanLargeTablet && (
                <Suspense fallback={<Spinner />}>
                  <RightColumnDesktop
                    ideaId={ideaId}
                    projectId={projectId}
                    statusId={statusId}
                    authorId={authorId}
                    showVoteControl={showVoteControl}
                    showBudgetControl={showBudgetControl}
                    participationContextId={participationContextId}
                    participationContextType={participationContextType}
                    budgetingDescriptor={budgetingDescriptor}
                    insideModal={insideModal}
                  />
                </Suspense>
              )}
            </Content>
          </IdeaContainer>
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
          {!loaded && (
            <Loading>
              <Spinner />
            </Loading>
          )}
          <CSSTransition
            classNames="content"
            in={loaded}
            timeout={{
              enter: contentFadeInDuration + contentFadeInDelay,
              exit: 0,
            }}
            enter={true}
            exit={false}
          >
            <Container id="e2e-idea-show" className={className}>
              {content}
            </Container>
          </CSSTransition>

          <FeatureFlag name="ideaflow_social_sharing">
            <Modal
              opened={!!ideaIdForSocialSharing}
              close={this.closeIdeaSocialSharingModal}
              hasSkipButton={true}
              skipText={<FormattedMessage {...messages.skipSharing} />}
            >
              {ideaIdForSocialSharing && (
                <SharingModalContent
                  postType="idea"
                  postId={ideaIdForSocialSharing}
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
  }
}

const IdeasShowWithHOCs = injectLocalize<Props>(
  injectIntl(withRouter(IdeasShow))
);

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetAppConfiguration />,
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
  ideaCustomFieldsSchemas: ({ projectId, render }) => {
    return (
      <GetIdeaCustomFieldsSchemas projectId={projectId}>
        {render}
      </GetIdeaCustomFieldsSchemas>
    );
  },
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
