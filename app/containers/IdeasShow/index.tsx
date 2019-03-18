import React, { PureComponent } from 'react';
import { has, isString, sortBy, last, get, isEmpty, trimEnd } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import linkifyHtml from 'linkifyjs/html';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import clHistory from 'utils/cl-router/history';

// components
import StatusBadge from 'components/StatusBadge';
import Comments from './CommentsContainer';
import Sharing from 'components/Sharing';
import IdeaMeta from './IdeaMeta';
import IdeaMap from './IdeaMap';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import SpamReportForm from 'containers/SpamReport';
import Modal from 'components/UI/Modal';
import VoteControl from 'components/VoteControl';
import VoteWrapper from './VoteWrapper';
import AssignBudgetWrapper from './AssignBudgetWrapper';
import ParentCommentForm from './ParentCommentForm';
import FileAttachments from 'components/UI/FileAttachments';
import IdeaSharingModalContent from './IdeaSharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import SimilarIdeas from './SimilarIdeas';
import HasPermission from 'components/HasPermission';
import IdeaHeader from './IdeaHeader';
import IdeaAuthor from './IdeaAuthor';
import Spinner, { ExtraProps as SpinnerProps } from 'components/UI/Spinner';
import OfficialFeedback from './OfficialFeedback';
import Icon from 'components/UI/Icon';
import IdeaBody from './IdeaBody';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// services
import { updateIdea } from 'services/ideas';
import { authUserStream } from 'services/auth';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import TranslateButton from './TranslateButton';

const loadingTimeout = 400;
const loadingEasing = 'ease-out';
const loadingDelay = 100;

const contentTimeout = 500;
const contentEasing = 'cubic-bezier(0.000, 0.700, 0.000, 1.000)';
const contentDelay = 500;
const contentTranslateDistance = '25px';

const StyledSpinner = styled<SpinnerProps>(Spinner)`
  transition: all ${loadingTimeout}ms ${loadingEasing} ${loadingDelay}ms;
`;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: opacity;

  &.loading-enter {
    ${StyledSpinner} {
      opacity: 0;
    }

    &.loading-enter-active {
      ${StyledSpinner} {
        opacity: 1;
      }
    }
  }
`;

const Container = styled.div`
  background: #fff;
  transform: none;
  will-change: transform, opacity;

  &.content-enter {
    opacity: 0;
    transform: translateY(${contentTranslateDistance});

    &.content-enter-active {
      opacity: 1;
      transform: translateY(0);
      transition: all ${contentTimeout}ms ${contentEasing} ${contentDelay}ms;
    }
  }

  &.content-exit {
    display: none;
  }
`;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: 820px;
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 60px;
  padding-bottom: 60px;
  padding-left: 20px;
  padding-right: 20px;
  position: relative;

  ${media.smallerThanMaxTablet`
    padding-top: 30px;
  `}
`;

const Content = styled.div`
  width: 100%;
  display: flex;

  ${media.smallerThanMaxTablet`
    flex-direction: column;
  `}
`;

const LeftColumn = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 0;
  margin: 0;
  padding: 0;
  padding-right: 55px;
  min-width: 0;

  ${media.smallerThanMaxTablet`
    padding: 0;
  `}
`;

const IdeaImage = styled.img`
  width: 100%;
  margin: 0 0 2rem;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${colors.separation};
`;

const MetaButtons = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
`;

const LocationLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 6px;
  max-width: 200px;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const LocationIconWrapper = styled.div`
  width: 22px;
  height: 36px;
  margin: 0;
  margin-right: 3px;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const LocationIcon = styled(Icon)`
  width: 18px;
  fill: ${colors.label};
`;

const LocationButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 30px;

  &:hover {
    ${LocationLabel} {
      color: ${darken(0.2, colors.label)};
    }

    ${LocationIcon} {
      fill: ${darken(0.2, colors.label)};
    }
  }
`;

const MapWrapper = styled.div`
  border-radius: 8px;
  border: 1px solid ${colors.separation};
  height: 265px;
  position: relative;
  overflow: hidden;
  z-index: 2;

  &.map-enter {
    height: 0;
    opacity: 0;

    &.map-enter-active {
      height: 265px;
      opacity: 1;
      transition: all 250ms ease-out;
    }
  }

  &.map-exit {
    height: 265px;
    opacity: 1;

    &.map-exit-active {
      height: 0;
      opacity: 0;
      transition: all 250ms ease-out;
    }
  }
`;

const MapPaddingBottom = styled.div`
  width: 100%;
  height: 30px;
`;

const AddressWrapper = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid ${colors.separation};
  margin: 0;
  padding: 10px;
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
`;

const StyledTranslateButton = styled(TranslateButton)`
  margin-bottom: 30px;
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-bottom: 112px;
`;

const CommentsTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  line-height: 38px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  margin-bottom: 20px;
`;

const SeparatorRow = styled.div`
  width: 100%;
  height: 1px;
  margin: 0;
  margin-top: 45px;
  margin-bottom: 25px;

  ${media.smallerThanMaxTablet`
    margin-top: 20px;
    margin-bottom: 20px;
  `}
`;

const RightColumn = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 200px;
  width: 200px;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  position: sticky;
  top: 95px;
  align-self: flex-start;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ControlWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;
`;

const VoteLabel = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-bottom: 12px;
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const StatusContainer = styled.div``;

const StatusContainerMobile = styled(StatusContainer)`
  margin-top: -20px;
  margin-bottom: 35px;
  transform-origin: top left;
  transform: scale(0.9);

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StatusTitle = styled.h4`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
`;

const VoteControlMobile = styled.div`
  border-top: solid 1px ${colors.separation};
  border-bottom: solid 1px ${colors.separation};
  padding-top: 15px;
  padding-bottom: 15px;
  margin-top: -10px;
  margin-bottom: 30px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const AssignBudgetControlMobile = styled.div`
  margin-top: 15px;
  margin-bottom: 25px;
  padding-top: 25px;
  border-top: solid 1px ${colors.separation};

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SharingMobile = styled(Sharing)`
  margin: 0;
  margin-bottom: 25px;
  padding: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: solid 1px ${colors.separation};
  border-bottom: solid 1px ${colors.separation};

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const MoreActionsMenuWrapper = styled.div`
  margin-top: 40px;
  user-select: none;

  * {
    user-select: none;
  }
`;

interface DataProps {
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  ideaImages: GetIdeaImagesChildProps;
  ideaComments: GetCommentsChildProps;
  ideaFiles: GetResourceFilesChildProps;
  authUser: GetAuthUserChildProps;
}

interface InputProps {
  ideaId: string | null;
  inModal?: boolean | undefined;
  animatePageEnter?: boolean;
}

interface Props extends DataProps, InputProps { }

type State = {
  opened: boolean;
  loaded: boolean;
  showMap: boolean;
  spamModalVisible: boolean;
  ideaIdForSocialSharing: string | null;
  translateButtonClicked: boolean;
  titleTranslationLoading: boolean;
  bodyTranslationLoading: boolean;
};

export class IdeasShow extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {
  initialState: State;
  ideaId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  static defaultProps = {
    animatePageEnter: true
  };

  constructor(props) {
    super(props);
    const initialState = {
      opened: false,
      loaded: false,
      showMap: false,
      spamModalVisible: false,
      ideaIdForSocialSharing: null,
      translateButtonClicked: false,
      titleTranslationLoading: false,
      bodyTranslationLoading: false
    };
    this.initialState = initialState;
    this.state = initialState;
    this.ideaId$ = new BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const query = clHistory.getCurrentLocation().query;
    const urlHasNewIdeaQueryParam = has(query, 'new_idea_id');
    const newIdea$ = urlHasNewIdeaQueryParam ? of({
      id: get(query, 'new_idea_id'),
      publish: get(query, 'publish')
    }) : of(null);

    this.subscriptions = [
      combineLatest(
        authUser$,
        newIdea$
      ).subscribe(async ([authUser, newIdea]) => {
        if (newIdea && isString(newIdea.id) && !isEmpty(newIdea.id)) {
          if (authUser) {
            setTimeout(() => {
              this.setState({ ideaIdForSocialSharing: newIdea.id });
            }, 2000);

            if (newIdea.publish === 'true') {
              await updateIdea(newIdea.id, { author_id: authUser.data.id, publication_status: 'published' });
              streams.fetchAllWith({ dataId: [newIdea.id], apiEndpoint: [`${API_PATH}/ideas`] });
            }
          }

          window.history.replaceState(null, '', window.location.pathname);
        }
      })
    ];
  }
  // more actions

  componentDidUpdate() {
    const { idea, ideaImages, project } = this.props;
    if (!this.state.opened && idea !== undefined) this.setState({ opened: true });
    if (!this.state.loaded
      && idea !== undefined
      && ideaImages !== undefined
      && project !== undefined
      ) {
      this.setState({ loaded: true });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleMapWrapperSetRef = (element: HTMLDivElement) => {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  handleMapToggle = () => {
    this.setState((state) => {
      const showMap = !state.showMap;
      return { showMap };
    });
  }

  openSpamModal = () => {
    this.setState({ spamModalVisible: true });
  }

  closeSpamModal = () => {
    this.setState({ spamModalVisible: false });
  }

  editIdea = () => {
    clHistory.push(`/ideas/edit/${this.props.ideaId}`);
  }

  unauthenticatedVoteClick = () => {
    clHistory.push('/sign-in');
  }

  closeIdeaSocialSharingModal = () => {
    this.setState({ ideaIdForSocialSharing: null });
  }

// ---------------describes idea to determine what to show---------------
  getActionsInfos = () => {
    const { project, phases, idea } = this.props;
    if (!isNilOrError(idea) && !isNilOrError(project)) {
      const pbProject = project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'budgeting' ? project : null;
      const pbPhase = (!pbProject && !isNilOrError(phases) ? phases.find(phase => phase.attributes.participation_method === 'budgeting') : null);
      const pbPhaseIsActive = (pbPhase && pastPresentOrFuture([pbPhase.attributes.start_at, pbPhase.attributes.end_at]) === 'present');
      const lastPhase = (phases ? last(sortBy(phases, [phase => phase.attributes.end_at])) : null);
      const pbPhaseIsLast = (pbPhase && lastPhase && lastPhase.id === pbPhase.id);

      const showBudgetControl = !!(pbProject || (pbPhase && (pbPhaseIsActive || pbPhaseIsLast)));

      const upvotesCount = idea.attributes.upvotes_count;
      const downvotesCount = idea.attributes.downvotes_count;
      const votingEnabled = idea.relationships.action_descriptor.data.voting.enabled;
      const cancellingEnabled = idea.relationships.action_descriptor.data.voting.cancelling_enabled;
      const votingFutureEnabled = idea.relationships.action_descriptor.data.voting.future_enabled;
      const hideVote = !(votingEnabled || cancellingEnabled || votingFutureEnabled || upvotesCount || downvotesCount);

      const showVoteControl = (!hideVote && !!((!pbProject && !pbPhase) || (pbPhase && !pbPhaseIsActive && !pbPhaseIsLast)));

      let participationContextType: 'Project' | 'Phase' | null = null;

      if (pbProject) {
        participationContextType = 'Project';
      } else if (pbPhase) {
        participationContextType = 'Phase';
      }

      let participationContextId: string | null = null;

      if (!isNilOrError(pbProject)) {
        participationContextId = pbProject.id;
      } else if (!isNilOrError(pbPhase)) {
        participationContextId = pbPhase.id;
      }
      const budgetingDescriptor = get(idea, 'data.relationships.action_descriptor.data.budgeting', null);

      return {
        participationContextType,
        participationContextId,
        budgetingDescriptor,
        showBudgetControl,
        showVoteControl
      };
    }

    return {
      participationContextType: null,
      participationContextId: null,
      budgetingDescriptor: null,
      showBudgetControl: null,
      showVoteControl: null
    };
  }

  translateIdea = () => {
    // tracking
    trackEvent(tracks.clickTranslateIdeaButton);

    this.setState({
      translateButtonClicked: true,
    });
  }

  backToOriginalContent = () => {
    // tracking
    trackEvent(tracks.clickGoBackToOriginalIdeaCopyButton);

    this.setState({
      translateButtonClicked: false,
    });
  }

  onTitleTranslationLoaded = () => this.setState({ titleTranslationLoading: false });
  onBodyTranslationLoaded = () => this.setState({ bodyTranslationLoading: false });

// ---------------Render---------------
  render() {
    const {
      inModal,
      animatePageEnter,
      ideaFiles,
      locale,
      idea,
      localize,
      ideaImages,
      ideaComments,
      authUser,
      project,
      intl: { formatMessage }
    } = this.props;
    const {
      opened,
      loaded,
      showMap,
      ideaIdForSocialSharing,
      translateButtonClicked,
      titleTranslationLoading,
      bodyTranslationLoading
    } = this.state;
    let content: JSX.Element | null = null;

    if (!isNilOrError(idea) && !isNilOrError(locale) && loaded) {
      const authorId = get(idea, 'relationships.author.data.id', null);
      const createdAt = idea.attributes.created_at;
      const titleMultiloc = idea.attributes.title_multiloc;
      const ideaTitle = localize(titleMultiloc);
      const statusId = get(idea, 'relationships.idea_status.data.id', null);
      const ideaImageLarge = !isNilOrError(ideaImages) && ideaImages.length > 0 ? get(ideaImages[0], 'attributes.versions.large', null) : null;
      const ideaLocation = (idea.attributes.location_point_geojson || null);
      const ideaAdress = (idea.attributes.location_description || null);
      const projectId = idea.relationships.project.data.id;
      const ideaUrl = location.href;
      const ideaId = idea.id;

      let ideaBody = localize(idea.attributes.body_multiloc);
      ideaBody = trimEnd(ideaBody, '<p><br></p>');
      ideaBody = trimEnd(ideaBody, '<p></p>');
      ideaBody = linkifyHtml(ideaBody);

      const utmParams = !isNilOrError(authUser) ? {
        source: 'share_idea',
        campaign: 'share_content',
        content: authUser.id
      } : {
        source: 'share_idea',
        campaign: 'share_content'
      };

      const {
        participationContextType,
        participationContextId,
        budgetingDescriptor,
        showBudgetControl,
        showVoteControl
      } = this.getActionsInfos();

      content = (
        <>
          <IdeaMeta
            ideaId={ideaId}
          />
          <IdeaContainer id="e2e-idea-show">
            <IdeaHeader
              ideaId={ideaId}
              ideaTitle={ideaTitle}
              projectId={projectId}
              locale={locale}
              translateButtonClicked={translateButtonClicked}
              onTranslationLoaded={this.onTitleTranslationLoaded}
            />

            <Content>
              <LeftColumn>
                {statusId &&
                  <StatusContainerMobile>
                    <StatusBadge statusId={statusId} />
                  </StatusContainerMobile>
                }

                {!inModal && showVoteControl &&
                  <VoteControlMobile>
                    <VoteControl
                      ideaId={ideaId}
                      unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                      size="1"
                    />
                  </VoteControlMobile>
                }

                {ideaImageLarge &&
                  <IdeaImage src={ideaImageLarge} alt={formatMessage(messages.imageAltText, { ideaTitle })} className="e2e-ideaImage"/>
                }

                <IdeaAuthor
                  ideaId={ideaId}
                  authorId={authorId}
                  ideaCreatedAt={createdAt}
                />

                <FeatureFlag name="machine_translations">
                  <StyledTranslateButton
                    idea={idea}
                    locale={locale}
                    translateButtonClicked={translateButtonClicked}
                    translationsLoading={titleTranslationLoading || bodyTranslationLoading}
                    translateIdea={this.translateIdea}
                    backToOriginalContent={this.backToOriginalContent}
                  />
                </FeatureFlag>

                <IdeaBody
                  ideaId={ideaId}
                  locale={locale}
                  ideaBody={ideaBody}
                  translateButtonClicked={translateButtonClicked}
                  onTranslationLoaded={this.onTitleTranslationLoaded}
                />

                {ideaLocation &&
                  <>
                    <CSSTransition
                      classNames="map"
                      in={showMap}
                      timeout={300}
                      mountOnEnter={true}
                      unmountOnExit={true}
                      exit={true}
                    >
                      <MapWrapper innerRef={this.handleMapWrapperSetRef}>
                        <IdeaMap location={ideaLocation} id={ideaId} />
                        {ideaAdress && <AddressWrapper>{ideaAdress}</AddressWrapper>}
                      </MapWrapper>
                    </CSSTransition>
                    {showMap &&  <MapPaddingBottom />}
                  </>
                }

                {ideaFiles && !isNilOrError(ideaFiles) &&
                  <FileAttachments files={ideaFiles} />
                }

                <SeparatorRow />

                {showBudgetControl && participationContextId && participationContextType && budgetingDescriptor &&
                  <AssignBudgetControlMobile>
                    <AssignBudgetWrapper
                      ideaId={ideaId}
                      projectId={projectId}
                      participationContextId={participationContextId}
                      participationContextType={participationContextType}
                      budgetingDescriptor={budgetingDescriptor}
                    />
                  </AssignBudgetControlMobile>
                }

                <SharingMobile
                  url={ideaUrl}
                  twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
                  emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
                  emailBody={formatMessage(messages.emailSharingBody, { ideaUrl, ideaTitle })}
                  utmParams={utmParams}
                />

                <StyledOfficialFeedback
                  project={project}
                  ideaId={ideaId}
                />

                {!isNilOrError(ideaComments) && ideaComments.length > 0 ?
                  <CommentsTitle>
                    <FormattedMessage {...messages.commentsTitle} />
                  </CommentsTitle>
                  :
                  <HasPermission item={!isNilOrError(project) ? project : null} action="moderate">
                    <HasPermission.No>
                      <CommentsTitle>
                        <FormattedMessage {...messages.commentsTitle} />
                      </CommentsTitle>
                    </HasPermission.No>
                  </HasPermission>
                }

                {!isNilOrError(project) &&
                  <HasPermission item={project} action="moderate">
                    <HasPermission.No>
                      <ParentCommentForm ideaId={ideaId} />
                    </HasPermission.No>
                  </HasPermission>
                }

                {ideaComments && <Comments ideaId={ideaId} />}
              </LeftColumn>

              <RightColumnDesktop>
                <MetaContent>
                  {(showVoteControl || showBudgetControl) &&
                    <ControlWrapper className="e2e-vote-controls-desktop">
                      {showVoteControl &&
                        <>
                          <VoteLabel>
                            <FormattedMessage {...messages.voteOnThisIdea} />
                          </VoteLabel>

                          <VoteWrapper
                            ideaId={ideaId}
                            votingDescriptor={idea.relationships.action_descriptor.data.voting}
                            projectId={projectId}
                          />
                        </>
                      }

                      {showBudgetControl && participationContextId && participationContextType && budgetingDescriptor &&
                        <AssignBudgetWrapper
                          ideaId={ideaId}
                          projectId={projectId}
                          participationContextId={participationContextId}
                          participationContextType={participationContextType}
                          budgetingDescriptor={budgetingDescriptor}
                        />
                      }
                    </ControlWrapper>
                  }

                  {statusId &&
                    <StatusContainer>
                      <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
                      <StatusBadge statusId={statusId} />
                    </StatusContainer>
                  }

                  <MetaButtons>
                    {ideaLocation && !showMap &&
                      <LocationButton onClick={this.handleMapToggle}>
                        <LocationIconWrapper>
                          <LocationIcon name="position" />
                        </LocationIconWrapper>
                        <LocationLabel>
                          <FormattedMessage {...messages.openMap} />
                        </LocationLabel>
                      </LocationButton>
                    }

                    {ideaLocation && showMap &&
                      <LocationButton onClick={this.handleMapToggle}>
                        <LocationIconWrapper>
                          <LocationIcon name="close" />
                        </LocationIconWrapper>
                        <LocationLabel>
                          <FormattedMessage {...messages.closeMap} />
                        </LocationLabel>
                      </LocationButton>
                    }

                    <SharingWrapper>
                      <Sharing
                        url={ideaUrl}
                        twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
                        emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
                        emailBody={formatMessage(messages.emailSharingBody, { ideaUrl, ideaTitle })}
                        utmParams={utmParams}
                      />
                    </SharingWrapper>

                    {!isNilOrError(authUser) &&
                      <MoreActionsMenuWrapper>
                        <MoreActionsMenu
                          actions={[
                            {
                              label: <FormattedMessage {...messages.reportAsSpam} />,
                              handler: this.openSpamModal,
                            },
                            {
                              label: <FormattedMessage {...messages.editIdea} />,
                              handler: this.editIdea,
                            }
                          ]}
                          label={<FormattedMessage {...messages.moreOptions} />}
                        />
                        <HasPermission item={idea} action="edit" context={idea}>
                          <HasPermission.No>
                            <MoreActionsMenu
                              actions={[{
                                label: <FormattedMessage {...messages.reportAsSpam} />,
                                handler: this.openSpamModal,
                              }]}
                              label={<FormattedMessage {...messages.moreOptions} />}
                            />
                          </HasPermission.No>
                        </HasPermission>
                      </MoreActionsMenuWrapper>
                    }
                  </MetaButtons>
                  <FeatureFlag name="similar_ideas">
                    <SimilarIdeas ideaId={ideaId} />
                  </FeatureFlag>
                </MetaContent>
              </RightColumnDesktop>
            </Content>
          </IdeaContainer>

          <Modal
            opened={this.state.spamModalVisible}
            close={this.closeSpamModal}
            label={formatMessage(messages.spanModalLabelIdea)}
            header={<FormattedMessage {...messages.reportAsSpamModalTitle} />}
          >
            <SpamReportForm
              resourceId={ideaId}
              resourceType="ideas"
            />
          </Modal>
        </>
      );
    }

    return (
      <>
        <CSSTransition
          classNames="loading"
          in={(opened && !loaded)}
          timeout={loadingTimeout}
          mountOnEnter={false}
          unmountOnExit={true}
          exit={false}
        >
          <Loading>
            <StyledSpinner />
          </Loading>
        </CSSTransition>

        <CSSTransition
          classNames="content"
          in={(opened && loaded)}
          timeout={contentTimeout + contentDelay}
          mountOnEnter={false}
          unmountOnExit={false}
          enter={animatePageEnter}
          exit={true}
        >
          <Container>
            {content}
          </Container>
        </CSSTransition>

        <FeatureFlag name="ideaflow_social_sharing">
          <Modal
            opened={!!ideaIdForSocialSharing}
            close={this.closeIdeaSocialSharingModal}
            fixedHeight={false}
            hasSkipButton={true}
            skipText={<FormattedMessage {...messages.skipSharing} />}
            label={formatMessage(messages.modalShareLabel)}
          >
            {ideaIdForSocialSharing &&
              <IdeaSharingModalContent ideaId={ideaIdForSocialSharing} />
            }
          </Modal>
        </FeatureFlag>
      </>
    );
  }
}

const IdeasShowWithHOCs = injectLocalize<Props>(injectIntl<Props & InjectedLocalized>(IdeasShow));

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  locale: <GetLocale />,
  project: ({ idea, render }) => !isNilOrError(idea) ? <GetProject id={idea.relationships.project.data.id}>{render}</GetProject> : null,
  phases: ({ idea, render }) => !isNilOrError(idea) ? <GetPhases projectId={idea.relationships.project.data.id}>{render}</GetPhases> : null,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  ideaComments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
  authUser: <GetAuthUser/>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
