import React, { PureComponent } from 'react';
import { has, isString, sortBy, last, get, isEmpty, trimEnd } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest, of, Observable } from 'rxjs';
import { tap, filter, map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import linkifyHtml from 'linkifyjs/html';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// router
import Link from 'utils/cl-router/Link';
import clHistory from 'utils/cl-router/history';

// components
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import Icon from 'components/UI/Icon';
import Comments from './CommentsContainer';
import Sharing from 'components/Sharing';
import IdeaMeta from './IdeaMeta';
import IdeaMap from './IdeaMap';
import Activities from './Activities';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import SpamReportForm from 'containers/SpamReport';
import Modal from 'components/UI/Modal';
import UserName from 'components/UI/UserName';
import VoteControl from 'components/VoteControl';
import VoteWrapper from './VoteWrapper';
import AssignBudgetWrapper from './AssignBudgetWrapper';
import ParentCommentForm from './ParentCommentForm';
import Spinner, { ExtraProps as SpinnerProps } from 'components/UI/Spinner';
import Fragment from 'components/Fragment';
import FileAttachments from 'components/UI/FileAttachments';
import IdeaSharingModalContent from './IdeaSharingModalContent';
import FeatureFlag from 'components/FeatureFlag';
import Button from 'components/UI/Button';
import SimilarIdeas from './SimilarIdeas';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenantLocales, { GetTenantLocalesChildProps } from 'resources/GetTenantLocales';
import GetMachineTranslation from 'resources/GetMachineTranslation';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { ideaByIdStream, updateIdea, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';
import { commentsForIdeaStream, IComments } from 'services/comments';
import { projectByIdStream, IProject } from 'services/projects';
import { phaseStream, IPhase } from 'services/phases';
import { authUserStream } from 'services/auth';
import { hasPermission } from 'services/permissions';

// i18n
import T from 'components/T';
import { FormattedRelative, InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { darken, lighten } from 'polished';
import QuillEditedContent from 'components/UI/QuillEditedContent';

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

const HeaderWrapper = styled.div`
  width: 100%;
  padding-right: 250px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    padding-right: 0px;
  `}
`;

const BelongsToProject = styled.p`
  width: 100%;
  color: ${colors.label};
  font-weight: 300;
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  margin-bottom: 15px;
`;

const ProjectLink = styled(Link)`
  color: inherit;
  font-weight: 400;
  font-size: inherit;
  line-height: inherit;
  text-decoration: underline;
  transition: all 100ms ease-out;
  margin-left: 4px;

  &:hover {
    color: ${darken(0.2, colors.label)};
    text-decoration: underline;
  }
`;

const Header = styled.div`
  margin-bottom: 45px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    margin-bottom: 30px;
  `}
`;

const IdeaTitle = styled.h1`
  width: 100%;
  color: #444;
  font-size: ${fontSizes.xxxxl}px;
  font-weight: 500;
  line-height: 38px;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 34px;
    margin-right: 12px;
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

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAndAdressWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 25px;
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

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
`;

const AuthorNameWrapper = styled.div`
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 20px;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.small}px;
    line-height: 18px;
  `}
`;

const AuthorName = styled(Link)`
  color: ${colors.clBlueDark};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 2px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
  `}
`;

const TranslateButton = styled(Button)`
  margin-bottom: 30px;
`;

const IdeaBody = styled.div`
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

const RightColumnDesktop = RightColumn.extend`
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

interface ITracks {
  clickTranslateIdeaButton: () => void;
  clickGoBackToOriginalIdeaCopyButton: () => void;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenantLocales: GetTenantLocalesChildProps;
  ideaFiles: GetResourceFilesChildProps;
}

interface InputProps {
  ideaId: string | null;
  inModal?: boolean | undefined;
  animatePageEnter?: boolean;
}

interface Props extends DataProps, InputProps { }

type State = {
  authUser: IUser | null;
  idea: IIdea | null;
  ideaBody: string;
  ideaAuthor: IUser | null;
  ideaImage: IIdeaImage | null;
  ideaComments: IComments | null;
  project: IProject | null;
  phases: IPhase[] | null;
  opened: boolean;
  loaded: boolean;
  showMap: boolean;
  spamModalVisible: boolean;
  moreActions: IAction[];
  ideaIdForSocialSharing: string | null;
  translateFromOriginalButtonClicked: boolean;
  titleTranslationLoading: boolean;
  bodyTranslationLoading: boolean;
};

export class IdeasShow extends PureComponent<Props & InjectedIntlProps & ITracks, State> {
  initialState: State;
  ideaId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  static defaultProps = {
    animatePageEnter: true
  };

  constructor(props) {
    super(props);
    const initialState = {
      authUser: null,
      idea: null,
      ideaBody: '',
      ideaAuthor: null,
      ideaImage: null,
      ideaComments: null,
      project: null,
      phases: null,
      opened: false,
      loaded: false,
      showMap: false,
      spamModalVisible: false,
      moreActions: [],
      ideaIdForSocialSharing: null,
      translateFromOriginalButtonClicked: false,
      titleTranslationLoading: false,
      bodyTranslationLoading: false,
    };
    this.initialState = initialState;
    this.state = initialState;
    this.ideaId$ = new BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.ideaId$.next(this.props.ideaId);

    const ideaId$ = this.ideaId$.pipe(
      distinctUntilChanged(),
      filter<string>(ideaId => isString(ideaId))
    );
    const locale$ = localeStream().observable;
    const tenantLocales$ = currentTenantStream().observable.pipe(
      map(currentTenant => currentTenant.data.attributes.settings.core.locales)
    );
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
      }),

      this.ideaId$.pipe(
        distinctUntilChanged(),
        filter(ideaId => !ideaId)
      ).subscribe(() => {
        this.setState(this.initialState);
      }),

      ideaId$.pipe(
        tap(() => this.setState({ opened: true })),
        switchMap((ideaId) => ideaByIdStream(ideaId).observable),
        switchMap((idea) => {
          const ideaImages = idea.data.relationships.idea_images.data;
          const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
          const ideaAuthorId = idea.data.relationships.author.data ? idea.data.relationships.author.data.id : null;
          const ideaImage$ = (ideaImageId ? ideaImageStream(idea.data.id, ideaImageId).observable : of(null));
          const ideaAuthor$ = ideaAuthorId ? userByIdStream(ideaAuthorId).observable : of(null);
          const project$ = (idea.data.relationships.project && idea.data.relationships.project.data ? projectByIdStream(idea.data.relationships.project.data.id).observable : of(null));
          let phases$: Observable<IPhase[] | null> = of(null);

          if (idea.data.attributes.budget && idea.data.relationships.phases && idea.data.relationships.phases.data.length > 0) {
            phases$ = combineLatest(
              idea.data.relationships.phases.data.map(phase => phaseStream(phase.id).observable)
            );
          }

          return combineLatest(
            locale$,
            tenantLocales$,
            authUser$,
            ideaImage$,
            ideaAuthor$,
            project$,
            phases$
          ).pipe(
            map(([locale, tenantLocales, authUser, ideaImage, ideaAuthor, project, phases]) => ({ locale, tenantLocales, authUser, idea, ideaImage, ideaAuthor, project, phases }))
          );
        })
      ).subscribe(({ locale, tenantLocales, authUser, idea, ideaImage, ideaAuthor, project, phases }) => {
        let ideaBody = getLocalized(idea.data.attributes.body_multiloc, locale, tenantLocales);
        ideaBody = trimEnd(ideaBody, '<p><br></p>');
        ideaBody = trimEnd(ideaBody, '<p></p>');
        ideaBody = linkifyHtml(ideaBody);
        this.setState({ authUser, idea, ideaBody, ideaImage, ideaAuthor, project, phases, loaded: true });
      }),

      ideaId$.pipe(
        switchMap((ideaId) => commentsForIdeaStream(ideaId).observable)
      ).subscribe((ideaComments) => {
        this.setState({ ideaComments });
      }),

      combineLatest(
        ideaId$.pipe(
          switchMap((ideaId) => ideaByIdStream(ideaId).observable)
        ),
        authUser$
      ).pipe(
        switchMap(([idea, authUser]) => {
          return hasPermission({
            item: idea && idea.data ? idea.data : null,
            action: 'edit',
            context: idea && idea.data ? idea.data : null,
          }).pipe(
            map((granted) => ({ authUser, granted }))
          );
        })
      ).subscribe(({ authUser, granted }) => {
        this.setState(() => {
          let moreActions: IAction[] = [];

          if (authUser) {
            moreActions = [
              ...moreActions,
              {
                label: <FormattedMessage {...messages.reportAsSpam} />,
                handler: this.openSpamModal,
              }
            ];
          }

          if (granted) {
            moreActions = [
              ...moreActions,
              {
                label: <FormattedMessage {...messages.editIdea} />,
                handler: this.editIdea,
              }
            ];
          }

          return { moreActions };
        });
      })
    ];
  }

  componentDidUpdate() {
    this.ideaId$.next(this.props.ideaId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToUserProfile = () => {
    const { ideaAuthor } = this.state;

    if (ideaAuthor) {
      clHistory.push(`/profile/${ideaAuthor.data.attributes.slug}`);
    }
  }

  handleMapToggle = () => {
    this.setState((state) => {
      const showMap = !state.showMap;
      return { showMap };
    });
  }

  handleMapWrapperSetRef = (element: HTMLDivElement) => {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
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

  translateIdea = () => {
    const { clickTranslateIdeaButton } = this.props;

    // tracking
    clickTranslateIdeaButton();

    this.setState({
      translateFromOriginalButtonClicked: true,
      titleTranslationLoading: true,
      bodyTranslationLoading: true,
    });
  }

  backToOriginalContent = () => {
    const { clickGoBackToOriginalIdeaCopyButton } = this.props;

    // tracking
    clickGoBackToOriginalIdeaCopyButton();

    this.setState({
       translateFromOriginalButtonClicked: false,
    });
  }

  render() {
    const { inModal, animatePageEnter, intl: { formatMessage }, ideaFiles, locale, tenantLocales } = this.props;
    const {
      idea,
      ideaBody,
      ideaImage,
      ideaAuthor,
      ideaComments,
      project,
      phases,
      opened,
      loaded,
      showMap,
      moreActions,
      ideaIdForSocialSharing,
      translateFromOriginalButtonClicked,
      titleTranslationLoading,
      bodyTranslationLoading
    } = this.state;
    let content: JSX.Element | null = null;
    const translationsLoading = titleTranslationLoading || bodyTranslationLoading;

    if (idea && !isNilOrError(locale) && !isNilOrError(tenantLocales)) {
      const authorId = ideaAuthor ? ideaAuthor.data.id : null;
      const createdAt = idea.data.attributes.created_at;
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const ideaTitle = getLocalized(titleMultiloc, locale, tenantLocales);
      const statusId = (idea.data.relationships.idea_status && idea.data.relationships.idea_status.data ? idea.data.relationships.idea_status.data.id : null);
      const ideaImageLarge = (ideaImage && has(ideaImage, 'data.attributes.versions.large') ? ideaImage.data.attributes.versions.large : null);
      const ideaLocation = (idea.data.attributes.location_point_geojson || null);
      const ideaAdress = (idea.data.attributes.location_description || null);
      const projectTitleMultiloc = (project && project.data ? project.data.attributes.title_multiloc : null);
      const projectId = idea.data.relationships.project.data.id;
      const ideaAuthorName = ideaAuthor && `${ideaAuthor.data.attributes.first_name} ${ideaAuthor.data.attributes.last_name}`;
      const ideaUrl = location.href;
      const auth = this.state.authUser;
      const utmParams = auth ? {
        source: 'share_idea',
        campaign: 'share_content',
        content: auth.data.id
      } : {
        source: 'share_idea',
        campaign: 'share_content'
      };
      const upvotesCount = idea.data.attributes.upvotes_count;
      const downvotesCount = idea.data.attributes.downvotes_count;
      const votingEnabled = idea.data.relationships.action_descriptor.data.voting.enabled;
      const cancellingEnabled = idea.data.relationships.action_descriptor.data.voting.cancelling_enabled;
      const votingFutureEnabled = idea.data.relationships.action_descriptor.data.voting.future_enabled;
      const hideVote = !(votingEnabled || cancellingEnabled || votingFutureEnabled || upvotesCount || downvotesCount);
      const projectProcessType = get(project, 'data.attributes.process_type');
      const projectParticipationMethod = get(project, 'data.attributes.participation_method');
      const pbProject = (project && projectProcessType === 'continuous' && projectParticipationMethod === 'budgeting' ? project : null);
      const pbPhase = (!pbProject && phases ? phases.find(phase => phase.data.attributes.participation_method === 'budgeting') : null);
      const pbPhaseIsActive = (pbPhase && pastPresentOrFuture([pbPhase.data.attributes.start_at, pbPhase.data.attributes.end_at]) === 'present');
      const lastPhase = (phases ? last(sortBy(phases, [phase => phase.data.attributes.end_at]) as IPhase[]) : null);
      const pbPhaseIsLast = (pbPhase && lastPhase && lastPhase.data.id === pbPhase.data.id);
      const showVoteControl = (!hideVote && !!((!pbProject && !pbPhase) || (pbPhase && !pbPhaseIsActive && !pbPhaseIsLast)));
      const showBudgetControl = !!(pbProject || (pbPhase && (pbPhaseIsActive || pbPhaseIsLast)));
      const budgetingDescriptor = get(idea.data.relationships.action_descriptor.data, 'budgeting', null);
      let participationContextType: 'Project' | 'Phase' | null = null;
      let participationContextId: string | null = null;
      let translateButton: JSX.Element | null = null;
      const showTranslateButton = !titleMultiloc[locale];

      if (showTranslateButton) {
        if (!translateFromOriginalButtonClicked) {
          translateButton = (
            <TranslateButton
              style="secondary-outlined"
              onClick={this.translateIdea}
              processing={translationsLoading}
              spinnerColor={colors.label}
              borderColor={lighten(.4, colors.label)}
            >
              <FormattedMessage {...messages.translateIdea} />
            </TranslateButton>
          );
        } else {
          translateButton = (
            <TranslateButton
              style="secondary-outlined"
              onClick={this.backToOriginalContent}
              processing={translationsLoading}
              spinnerColor={colors.label}
              borderColor={lighten(.4, colors.label)}
            >
              <FormattedMessage {...messages.backToOriginalContent} />
            </TranslateButton>
          );
        }
      }

      if (pbProject) {
        participationContextType = 'Project';
      } else if (pbPhase) {
        participationContextType = 'Phase';
      }

      if (pbProject) {
        participationContextId = pbProject.data.id;
      } else if (pbPhase) {
        participationContextId = pbPhase.data.id;
      }

      content = (
        <>
          <IdeaMeta
            ideaId={idea.data.id}
            titleMultiloc={titleMultiloc}
            bodyMultiloc={idea.data.attributes.body_multiloc}
            ideaAuthorName={ideaAuthorName}
            ideaImages={ideaImage}
            publishedAt={idea.data.attributes.published_at}
            projectTitle={projectTitleMultiloc}
            projectSlug={project && project.data.attributes.slug}
          />
          <IdeaContainer id="e2e-idea-show">
            <HeaderWrapper>
              {project && projectTitleMultiloc &&
                <BelongsToProject>
                  <FormattedMessage
                    {...messages.postedIn}
                    values={{
                      projectLink:
                        <ProjectLink to={`/projects/${project.data.attributes.slug}`}>
                          <T value={projectTitleMultiloc} />
                        </ProjectLink>
                    }}
                  />
                </BelongsToProject>
              }

              <Header>
                {translateFromOriginalButtonClicked ?
                  <GetMachineTranslation attributeName="title_multiloc" localeTo={locale} ideaId={idea.data.id}>
                    {translation => {
                      if (!isNilOrError(translation)) {
                        this.setState({ titleTranslationLoading: false });
                        return <IdeaTitle>{translation.attributes.translation}</IdeaTitle>;
                      }

                      return <IdeaTitle>{ideaTitle}</IdeaTitle>;
                    }}
                  </GetMachineTranslation>
                  :
                  <IdeaTitle className="e2e-ideatitle">{ideaTitle}</IdeaTitle>
                }
              </Header>
            </HeaderWrapper>

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
                      ideaId={idea.data.id}
                      unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                      size="1"
                    />
                  </VoteControlMobile>
                }

                {ideaImageLarge &&
                  <IdeaImage src={ideaImageLarge} alt={formatMessage(messages.imageAltText, { ideaTitle })} />
                }

                <AuthorAndAdressWrapper>
                  <AuthorContainer>
                    <Avatar
                      userId={authorId}
                      size="40px"
                      onClick={authorId ? this.goToUserProfile : () => { }}
                    />
                    <AuthorMeta>
                      <AuthorNameWrapper>
                        <FormattedMessage
                          {...messages.byAuthorName}
                          values={{
                            authorName: (
                              <AuthorName to={ideaAuthor ? `/profile/${ideaAuthor.data.attributes.slug}` : ''}>
                                <UserName user={(ideaAuthor ? ideaAuthor.data : null)} />
                              </AuthorName>
                            )
                          }}
                        />
                      </AuthorNameWrapper>
                      {createdAt &&
                        <TimeAgo>
                          <FormattedRelative value={createdAt} />
                          <Activities ideaId={idea.data.id} />
                        </TimeAgo>
                      }
                    </AuthorMeta>
                  </AuthorContainer>
                </AuthorAndAdressWrapper>

                <FeatureFlag name="machine_translations">
                  {translateButton}
                </FeatureFlag>

                {ideaLocation &&
                  <CSSTransition
                    classNames="map"
                    in={showMap}
                    timeout={300}
                    mountOnEnter={true}
                    unmountOnExit={true}
                    exit={true}
                  >
                    <MapWrapper innerRef={this.handleMapWrapperSetRef}>
                      <IdeaMap location={ideaLocation} id={idea.data.id} />
                      {ideaAdress && <AddressWrapper>{ideaAdress}</AddressWrapper>}
                    </MapWrapper>
                  </CSSTransition>
                }

                {ideaLocation && showMap &&
                  <MapPaddingBottom />
                }

                <Fragment name={`ideas/${idea.data.id}/body`}>
                  <IdeaBody className={`${!ideaImageLarge && 'noImage'}`}>
                    <QuillEditedContent>
                      {translateFromOriginalButtonClicked ?
                        <GetMachineTranslation attributeName="body_multiloc" localeTo={locale} ideaId={idea.data.id}>
                          {translation => {
                            if (!isNilOrError(translation)) {
                              this.setState({ bodyTranslationLoading: false });
                              return <span dangerouslySetInnerHTML={{ __html: linkifyHtml(translation.attributes.translation) }}/>;
                            }

                            return <span dangerouslySetInnerHTML={{ __html: linkifyHtml(ideaBody) }} />;
                          }}
                        </GetMachineTranslation>
                        :
                        <span dangerouslySetInnerHTML={{ __html: linkifyHtml(ideaBody) }} />
                      }
                    </QuillEditedContent>
                  </IdeaBody>
                </Fragment>

                {ideaFiles && !isNilOrError(ideaFiles) &&
                  <FileAttachments files={ideaFiles} />
                }

                <SeparatorRow />

                {showBudgetControl && participationContextId && participationContextType && budgetingDescriptor &&
                  <AssignBudgetControlMobile>
                    <AssignBudgetWrapper
                      ideaId={idea.data.id}
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

                <CommentsTitle>
                  <FormattedMessage {...messages.commentsTitle} />
                </CommentsTitle>

                <ParentCommentForm ideaId={idea.data.id} />

                {ideaComments && <Comments ideaId={idea.data.id} />}
              </LeftColumn>

              <RightColumnDesktop>
                <MetaContent>

                  {(showVoteControl || showBudgetControl) &&
                    <ControlWrapper>
                      {showVoteControl &&
                        <>
                          <VoteLabel>
                            <FormattedMessage {...messages.voteOnThisIdea} />
                          </VoteLabel>

                          <VoteWrapper
                            ideaId={idea.data.id}
                            votingDescriptor={idea.data.relationships.action_descriptor.data.voting}
                            projectId={projectId}
                          />
                        </>
                      }

                      {showBudgetControl && participationContextId && participationContextType && budgetingDescriptor &&
                        <AssignBudgetWrapper
                          ideaId={idea.data.id}
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

                    {(moreActions && moreActions.length > 0) &&
                      <MoreActionsMenuWrapper>
                        <MoreActionsMenu
                          actions={moreActions}
                          label={<FormattedMessage {...messages.moreOptions} />}
                        />
                      </MoreActionsMenuWrapper>
                    }
                  </MetaButtons>
                  <FeatureFlag name="similar_ideas">
                    <SimilarIdeas ideaId={idea.data.id} />
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
            <SpamReportForm resourceId={idea.data.id} resourceType="ideas" />
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

const IdeasShowWithHOCs = injectTracks<Props>(tracks)(injectIntl(IdeasShow));

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenantLocales: <GetTenantLocales />,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
