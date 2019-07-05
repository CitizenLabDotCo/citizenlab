import React, { PureComponent } from 'react';
import { sortBy, last, get, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import Sharing from 'components/Sharing';
import IdeaMeta from './IdeaMeta';
import IdeaMap from './IdeaMapLoadable';
import Modal from 'components/UI/Modal';
import VoteWrapper from './VoteWrapper';
import AssignBudgetWrapper from './AssignBudgetWrapper';
import FileAttachments from 'components/UI/FileAttachments';
import IdeaSharingModalContent from './IdeaSharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import SimilarIdeas from './SimilarIdeas';
import IdeaTopics from './IdeaTopics';
import IdeaTitle from './IdeaTitle';
import IdeaStatus from './IdeaStatus';
import IdeaPostedBy from './IdeaPostedBy';
import IdeaAuthor from './IdeaAuthor';
import IdeaFooter from './IdeaFooter';
import Spinner from 'components/UI/Spinner';
import OfficialFeedback from './OfficialFeedback';
import IdeaBody from './IdeaBody';
import IdeaContentFooter from './IdeaContentFooter';
import ActionBar from './ActionBar';
import TranslateButton from './TranslateButton';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';

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
import { media, colors, fontSizes, ideaPageContentMaxWidth, viewportWidths } from 'utils/styleUtils';
import { columnsGapDesktop, rightColumnWidthDesktop, columnsGapTablet, rightColumnWidthTablet } from './styleConstants';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Loading = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  background: #fff;
  opacity: 0;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}

  &.content-enter {
    opacity: 0;

    &.content-enter-active {
      opacity: 1;
      transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing} ${contentFadeInDelay}ms;
    }
  }

  &.content-enter-done {
    opacity: 1;
  }
`;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: ${ideaPageContentMaxWidth};
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  padding-top: 60px;
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

const StyledIdeaTopics = styled(IdeaTopics)`
  padding-right: ${rightColumnWidthDesktop + columnsGapDesktop}px;
  margin-bottom: 10px;

  ${media.tablet`
    padding-right: ${rightColumnWidthTablet + columnsGapTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    padding-right: 0px;
    margin-bottom: 5px;
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

const StyledTranslateButtonMobile = styled(TranslateButton)`
  display: none;
  width: fit-content;
  margin-bottom: 40px;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

const IdeaHeader = styled.div`
  margin-top: -5px;
  margin-bottom: 28px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    margin-bottom: 45px;
  `}
`;

const IdeaImage = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${colors.separation};
`;

const StyledMobileIdeaPostedBy = styled(IdeaPostedBy)`
  margin-top: 4px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledMobileIdeaStatus = styled(IdeaStatus)`
  margin-bottom: 30px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledIdeaAuthor = styled(IdeaAuthor)`
  margin-left: -4px;
  margin-bottom: 50px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledIdeaMap = styled(IdeaMap)`
  margin-bottom: 40px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 20px;
  `}
`;

const RightColumn = styled.div`
  flex: 1;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = styled(RightColumn)`
  flex: 0 0 ${rightColumnWidthDesktop}px;
  width: ${rightColumnWidthDesktop}px;

  ${media.tablet`
    flex: 0 0 ${rightColumnWidthTablet}px;
    width: ${rightColumnWidthTablet}px;
  `}

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
  margin-bottom: 45px;
  padding: 35px;
  border: 1px solid #e0e0e0;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const ControlWrapperHorizontalRule: any = styled.hr`
  width: 100%;
  border: none;
  height: 1px;
  background-color: ${colors.separation};
  margin: 35px 0;
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

const AssignBudgetControlMobile = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSimilarIdeas = styled(SimilarIdeas)`
  margin-top: 45px;
`;

const SharingMobile = styled(Sharing)`
  padding: 0;
  margin: 0;
  margin-top: 40px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 80px;
`;

interface DataProps {
  idea: GetIdeaChildProps;
  locale: GetLocaleChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  ideaImages: GetIdeaImagesChildProps;
  ideaFiles: GetResourceFilesChildProps;
  authUser: GetAuthUserChildProps;
  windowSize: GetWindowSizeChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface InputProps {
  ideaId: string | null;
  inModal?: boolean | undefined;
  className?: string;
}

interface Props extends DataProps, InputProps {}

interface IActionInfos {
  participationContextType: 'Project' | 'Phase' | null;
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

export class IdeasShow extends PureComponent<Props & InjectedIntlProps & InjectedLocalized & WithRouterProps, State> {
  initialState: State;

  constructor(props) {
    super(props);
    const initialState = {
      loaded: false,
      spamModalVisible: false,
      ideaIdForSocialSharing: null,
      translateButtonClicked: false,
      ideaBody: null,
      actionInfos: null
    };
    this.initialState = initialState;
    this.state = initialState;
  }

  componentDidMount() {
    const newIdeaId = get(this.props.location.query, 'new_idea_id');

    this.setLoaded();

    if (newIdeaId) {
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
    const { idea, project, phases } = nextProps;
    let stateToUpdate: Partial<State> | null = null;

    if (!actionInfos && !isNilOrError(idea) && !isNilOrError(project) && !isUndefined(phases)) {
      const upvotesCount = idea.attributes.upvotes_count;
      const downvotesCount = idea.attributes.downvotes_count;
      const votingEnabled = idea.relationships.action_descriptor.data.voting.enabled;
      const cancellingEnabled = idea.relationships.action_descriptor.data.voting.cancelling_enabled;
      const votingFutureEnabled = idea.relationships.action_descriptor.data.voting.future_enabled;
      const pbProject = (project.attributes.process_type === 'continuous' && project.attributes.participation_method === 'budgeting' ? project : null);
      const pbPhase = (!pbProject && !isNilOrError(phases) ? phases.find(phase => phase.attributes.participation_method === 'budgeting') : null);
      const pbPhaseIsActive = (pbPhase && pastPresentOrFuture([pbPhase.attributes.start_at, pbPhase.attributes.end_at]) === 'present');
      const lastPhase = (!isNilOrError(phases) ? last(sortBy(phases, [phase => phase.attributes.end_at])) : null);
      const lastPhaseHasPassed = (lastPhase ? pastPresentOrFuture([lastPhase.attributes.start_at, lastPhase.attributes.end_at]) === 'past' : false);
      const pbPhaseIsLast = (pbPhase && lastPhase && lastPhase.id === pbPhase.id);
      const showBudgetControl = !!(pbProject || (pbPhase && (pbPhaseIsActive || (lastPhaseHasPassed && pbPhaseIsLast))));
      const showVoteControl = !!(!showBudgetControl && (votingEnabled || cancellingEnabled || votingFutureEnabled || upvotesCount > 0 || downvotesCount > 0));
      const budgetingDescriptor = get(idea, 'relationships.action_descriptor.data.budgeting', null);
      let participationContextType: 'Project' | 'Phase' | null = null;
      let participationContextId: string | null = null;

      if (pbProject) {
        participationContextType = 'Project';
      } else if (pbPhase) {
        participationContextType = 'Phase';
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
          showVoteControl
        }
      };
    }

    return stateToUpdate;
  }

  setLoaded = () => {
    const { loaded } = this.state;
    const { idea, ideaImages, project, officialFeedbacks } = this.props;

    if (!loaded && !isNilOrError(idea) && !isUndefined(ideaImages) && !isNilOrError(project) && !isUndefined(officialFeedbacks.officialFeedbacksList)) {
      this.setState({ loaded: true });
    }
  }

  closeIdeaSocialSharingModal = () => {
    this.setState({ ideaIdForSocialSharing: null });
  }

  onTranslateIdea = () => {
    this.setState(prevState => {
      // analytics
      if (prevState.translateButtonClicked === true) {
        trackEvent(tracks.clickGoBackToOriginalIdeaCopyButton);
      } else if (prevState.translateButtonClicked === false) {
        trackEvent(tracks.clickTranslateIdeaButton);
      }

      return ({
        translateButtonClicked: !prevState.translateButtonClicked
      });
    });
  }

  render() {
    const {
      ideaFiles,
      locale,
      idea,
      localize,
      ideaImages,
      authUser,
      windowSize,
      className
    } = this.props;
    const { loaded, ideaIdForSocialSharing, translateButtonClicked, actionInfos } = this.state;
    const { formatMessage } = this.props.intl;
    let content: JSX.Element | null = null;

    if (!isNilOrError(idea) && !isNilOrError(locale) && loaded) {
      const authorId: string | null = get(idea, 'relationships.author.data.id', null);
      const ideaCreatedAt = idea.attributes.created_at;
      const titleMultiloc = idea.attributes.title_multiloc;
      const ideaTitle = localize(titleMultiloc);
      // If you're not an admin/mod, statusId can be null
      const statusId: string | null = get(idea, 'relationships.idea_status.data.id', null);
      const ideaImageLarge: string | null = get(ideaImages, '[0].attributes.versions.large', null);
      const ideaLocation = (idea.attributes.location_point_geojson || null);
      const ideaAdress = (idea.attributes.location_description || null);
      const projectId = idea.relationships.project.data.id;
      const topicIds = (idea.relationships.topics.data ? idea.relationships.topics.data.map(item => item.id) : []);
      const ideaUrl = location.href;
      const ideaId = idea.id;
      const ideaBody = localize(idea.attributes.body_multiloc);
      const participationContextType = get(actionInfos, 'participationContextType', null);
      const participationContextId = get(actionInfos, 'participationContextId', null);
      const budgetingDescriptor = get(actionInfos, 'budgetingDescriptor', null);
      const showBudgetControl = get(actionInfos, 'showBudgetControl', null);
      const showVoteControl = get(actionInfos, 'showVoteControl', null);
      const biggerThanLargeTablet = windowSize ? windowSize > viewportWidths.largeTablet : false;
      const smallerThanLargeTablet = windowSize ? windowSize <= viewportWidths.largeTablet : false;
      const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;
      const utmParams = !isNilOrError(authUser) ? {
        source: 'share_idea',
        campaign: 'share_content',
        content: authUser.id
      } : {
        source: 'share_idea',
        campaign: 'share_content'
      };
      const showTranslateButton = (
        !isNilOrError(idea) &&
        !isNilOrError(locale) &&
        !idea.attributes.title_multiloc[locale]
      );

      content = (
        <>
          <IdeaMeta ideaId={ideaId} />

          <ActionBar
            ideaId={ideaId}
            translateButtonClicked={translateButtonClicked}
            onTranslateIdea={this.onTranslateIdea}
          />

          <IdeaContainer>
            <FeatureFlag name="machine_translations">
              {showTranslateButton && smallerThanSmallTablet &&
                <StyledTranslateButtonMobile
                  translateButtonClicked={translateButtonClicked}
                  onClick={this.onTranslateIdea}
                />
              }
            </FeatureFlag>

            <StyledIdeaTopics topicIds={topicIds} />

            <Content>
              <LeftColumn>
                <IdeaHeader>
                  <IdeaTitle
                    ideaId={ideaId}
                    ideaTitle={ideaTitle}
                    locale={locale}
                    translateButtonClicked={translateButtonClicked}
                  />

                  {smallerThanLargeTablet &&
                    <StyledMobileIdeaPostedBy authorId={authorId} />
                  }
                </IdeaHeader>

                {statusId && smallerThanLargeTablet &&
                  <StyledMobileIdeaStatus statusId={statusId} />
                }

                {biggerThanLargeTablet &&
                  <StyledIdeaAuthor
                    ideaId={ideaId}
                    authorId={authorId}
                    ideaCreatedAt={ideaCreatedAt}
                  />
                }

                {ideaImageLarge &&
                  <IdeaImage
                    src={ideaImageLarge}
                    alt={formatMessage(messages.imageAltText, { ideaTitle })}
                    className="e2e-ideaImage"
                  />
                }

                {ideaLocation && ideaAdress &&
                  <StyledIdeaMap
                    adress={ideaAdress}
                    location={ideaLocation}
                    id={ideaId}
                  />
                }

                <IdeaBody
                  ideaId={ideaId}
                  locale={locale}
                  ideaBody={ideaBody}
                  translateButtonClicked={translateButtonClicked}
                />

                {!isNilOrError(ideaFiles) && ideaFiles.length > 0 &&
                  <FileAttachments files={ideaFiles} />
                }

                {showBudgetControl &&
                 participationContextId &&
                 participationContextType &&
                 budgetingDescriptor &&
                 smallerThanLargeTablet &&
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

                <StyledOfficialFeedback
                  ideaId={ideaId}
                />

                <IdeaContentFooter
                  ideaId={ideaId}
                  ideaCreatedAt={ideaCreatedAt}
                  commentsCount={idea.attributes.comments_count}
                />

                {smallerThanLargeTablet &&
                  <SharingMobile
                    context="idea"
                    url={ideaUrl}
                    twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
                    emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
                    emailBody={formatMessage(messages.emailSharingBody, { ideaUrl, ideaTitle })}
                    utmParams={utmParams}
                  />
                }
              </LeftColumn>

              {biggerThanLargeTablet &&
                <RightColumnDesktop>
                  <MetaContent>
                    {(showVoteControl || showBudgetControl || statusId) &&
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

                        {(showVoteControl || showBudgetControl) &&
                          <ControlWrapperHorizontalRule />
                        }

                        {statusId &&
                          <IdeaStatus statusId={statusId} />
                        }
                      </ControlWrapper>
                    }

                    <SharingWrapper>
                      <Sharing
                        context="idea"
                        url={ideaUrl}
                        twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle })}
                        emailSubject={formatMessage(messages.emailSharingSubject, { ideaTitle })}
                        emailBody={formatMessage(messages.emailSharingBody, { ideaUrl, ideaTitle })}
                        utmParams={utmParams}
                      />
                    </SharingWrapper>

                    <FeatureFlag name="similar_ideas">
                      <StyledSimilarIdeas ideaId={ideaId} />
                    </FeatureFlag>

                  </MetaContent>
                </RightColumnDesktop>
              }
            </Content>
          </IdeaContainer>

          {loaded && <IdeaFooter ideaId={ideaId} />}
        </>
      );
    }

    return (
      <>
        {!loaded &&
          <Loading>
            <Spinner />
          </Loading>
        }

        <CSSTransition
          classNames="content"
          in={loaded}
          timeout={{
            enter: contentFadeInDuration + contentFadeInDelay,
            exit: 0
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

const IdeasShowWithHOCs = injectLocalize<Props>(injectIntl(withRouter(IdeasShow)));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser/>,
  windowSize: <GetWindowSize debounce={50} />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>,
  project: ({ idea, render }) => <GetProject id={get(idea, 'relationships.project.data.id')}>{render}</GetProject>,
  phases: ({ idea, render }) => <GetPhases projectId={get(idea, 'relationships.project.data.id')}>{render}</GetPhases>,
  officialFeedbacks: ({ ideaId, render }) => <GetOfficialFeedbacks ideaId={ideaId}>{render}</GetOfficialFeedbacks>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
