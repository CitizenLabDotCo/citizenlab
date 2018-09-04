import React, { PureComponent } from 'react';
import { has, isString, get } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import { tap, filter, map, switchMap, distinctUntilChanged } from 'rxjs/operators';
import linkifyHtml from 'linkifyjs/html';

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
import VoteWrapper from './VoteWrapper';
import ParentCommentForm from './ParentCommentForm';
import Spinner from 'components/UI/Spinner';
import VoteControl from 'components/VoteControl';
import Fragment from 'components/Fragment';

// services
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';
import { ideaStatusStream } from 'services/ideaStatuses';
import { commentsForIdeaStream, IComments } from 'services/comments';
import { projectByIdStream, IProject } from 'services/projects';
import { authUserStream } from 'services/auth';
import { hasPermission } from 'services/permissions';

// i18n
import T from 'components/T';
import { FormattedRelative, InjectedIntlProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { media, color, colors, fontSizes, quillEditedContent } from 'utils/styleUtils';
import { darken } from 'polished';

const loadingTimeout = 400;
const loadingEasing = 'ease-out';
const loadingDelay = 100;

const contentTimeout = 500;
const contentEasing = `cubic-bezier(0.000, 0.700, 0.000, 1.000)`;
const contentDelay = 600;
const contentTranslateDistance = '30px';

const StyledSpinner = styled(Spinner) `
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
  padding-left: 30px;
  padding-right: 30px;
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

const ProjectLink = styled(Link) `
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
  border: 1px solid ${color('separation')};
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
  width: 30px;
  height: 38px;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const LocationIcon = styled(Icon) `
  width: 18px;
  fill: ${colors.label};
`;

const LocationButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;

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
  border: 1px solid ${color('separation')};
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
  border-top: 1px solid #eaeaea;
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

const IdeaBody = styled.div`
  color: #474747;
  font-size: ${fontSizes.large}px;
  font-weight: 300;
  line-height: 32px;
  word-break: break-word;

  p {
    margin-bottom: 32px;

    &:last-child {
      margin-bottom: 0px;
    }
  }

  a {
    color: ${colors.clBlueDark};
    text-decoration: none;

    &:hover {
      color: ${darken(0.15, colors.clBlueDark)};
      text-decoration: underline;
    }
  }

  ul {
    list-style-type: disc;
    list-style-position: outside;
    padding: 0;
    padding-left: 30px;
    margin: 0;
    margin-bottom: 25px;

    li {
      padding: 0;
      padding-top: 2px;
      padding-bottom: 2px;
      margin: 0;
    }
  }

  strong {
    font-weight: 500;
  }

  ${quillEditedContent()}
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
  flex: 0 0 auto;
  width: 200px;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = RightColumn.extend`
  position: sticky;
  top: 95px;
  align-self: flex-start;
  transform: translate3d(0, 0, 0);

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MetaContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
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

const StatusContainer = styled.div`
  margin-top: 35px;
`;

const StatusContainerMobile = styled(StatusContainer) `
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
  border-top: solid 1px #e0e0e0;
  border-bottom: solid 1px #e0e0e0;
  padding-top: 15px;
  padding-bottom: 15px;
  margin-top: -10px;
  margin-bottom: 30px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSharing: any = styled(Sharing) ``;

const StyledSharingMobile = styled(StyledSharing) `
  margin: 0;
  margin-bottom: 25px;
  padding: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: solid 1px #e0e0e0;
  border-bottom: solid 1px #e0e0e0;

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

type Props = {
  ideaId: string | null;
  inModal?: boolean | undefined;
};

type State = {
  authUser: IUser | null;
  idea: IIdea | null;
  ideaAuthor: IUser | null;
  ideaImage: IIdeaImage | null;
  ideaComments: IComments | null;
  project: IProject | null;
  opened: boolean;
  loaded: boolean;
  showMap: boolean;
  spamModalVisible: boolean;
  moreActions: IAction[];
};

export class IdeasShow extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {
  initialState: State;
  ideaId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  constructor(props: Props & InjectedIntlProps & InjectedLocalized) {
    super(props);
    const initialState = {
      authUser: null,
      idea: null,
      ideaAuthor: null,
      ideaImage: null,
      ideaComments: null,
      project: null,
      opened: false,
      loaded: false,
      showMap: false,
      spamModalVisible: false,
      moreActions: []
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
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
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
          const ideaStatusId : string | null = get(idea, 'data.relationships.idea_status.data.id', null);
          const ideaImage$ = (ideaImageId ? ideaImageStream(idea.data.id, ideaImageId).observable : of(null));
          const ideaAuthor$ = ideaAuthorId ? userByIdStream(ideaAuthorId).observable : of(null);
          const ideaStatus$ = (ideaStatusId ? ideaStatusStream(ideaStatusId).observable : of(null));
          const project$ = (idea.data.relationships.project && idea.data.relationships.project.data ? projectByIdStream(idea.data.relationships.project.data.id).observable : of(null));

          return combineLatest(
            authUser$,
            ideaImage$,
            ideaAuthor$,
            ideaStatus$,
            project$,
          ).pipe(
            map(([authUser, ideaImage, ideaAuthor, _ideaStatus, project]) => ({ authUser, idea, ideaImage, ideaAuthor, project }))
          );
        })
      ).subscribe(({ authUser, idea, ideaImage, ideaAuthor, project }) => {
        this.setState({ authUser, idea, ideaImage, ideaAuthor, project, loaded: true });
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
            item: idea  && idea.data ? idea.data : null,
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
                handler: this.openSpamModal
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
      element.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });
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

  render() {
    const { inModal, intl: { formatMessage } } = this.props;
    const { idea, ideaImage, ideaAuthor, ideaComments, project, opened, loaded, showMap, moreActions, authUser } = this.state;
    let loader: JSX.Element | null = null;
    let content: JSX.Element | null = null;

    if (opened && !loaded) {
      loader = (
        <StyledSpinner size="32px" />
      );
    }

    if (idea) {
      const authorId = ideaAuthor ? ideaAuthor.data.id : null;
      const createdAt = idea.data.attributes.created_at;
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const ideaBody = linkifyHtml(this.props.localize(idea.data.attributes.body_multiloc));
      const statusId = (idea.data.relationships.idea_status && idea.data.relationships.idea_status.data ? idea.data.relationships.idea_status.data.id : null);
      const ideaImageLarge = (ideaImage && has(ideaImage, 'data.attributes.versions.large') ? ideaImage.data.attributes.versions.large : null);
      const ideaLocation = (idea.data.attributes.location_point_geojson || null);
      const ideaAdress = (idea.data.attributes.location_description || null);
      const projectTitleMultiloc = (project && project.data ? project.data.attributes.title_multiloc : null);
      const projectId = idea.data.relationships.project.data.id;

      const ideaAuthorName = ideaAuthor && `${ideaAuthor.data.attributes.first_name} ${ideaAuthor.data.attributes.last_name}`;

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
                <IdeaTitle>
                  <T value={titleMultiloc} />
                </IdeaTitle>
              </Header>
            </HeaderWrapper>

            <Content>
              <LeftColumn>
                {statusId &&
                  <StatusContainerMobile>
                    <StatusBadge statusId={statusId} />
                  </StatusContainerMobile>
                }

                {!inModal &&
                  <VoteControlMobile>
                    <VoteControl
                      ideaId={idea.data.id}
                      unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                      size="1"
                    />
                  </VoteControlMobile>
                }

                {ideaImageLarge &&
                  <T value={titleMultiloc}>
                    {(ideaTitle) => <IdeaImage src={ideaImageLarge} alt={formatMessage(messages.imageAltText, { ideaTitle })} />}
                  </T>
                }

                <AuthorAndAdressWrapper>
                  <AuthorContainer>
                    <Avatar
                      userId={authorId}
                      size="medium"
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
                    <span dangerouslySetInnerHTML={{ __html: ideaBody }} />
                  </IdeaBody>
                </Fragment>

                <SeparatorRow />

                <T value={titleMultiloc} maxLength={50} >
                  {(title) => {
                    return (
                      <StyledSharingMobile
                        twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle: title })}
                        sharedContent="idea"
                        userId={authUser && authUser.data.id}
                      />);
                  }}
                </T>

                <CommentsTitle>
                  <FormattedMessage {...messages.commentsTitle} />
                </CommentsTitle>

                <ParentCommentForm ideaId={idea.data.id} />

                {ideaComments && <Comments ideaId={idea.data.id} />}
              </LeftColumn>

              <RightColumnDesktop>
                <MetaContent>
                  <VoteLabel>
                    <FormattedMessage {...messages.voteOnThisIdea} />
                  </VoteLabel>

                  <VoteWrapper
                    ideaId={idea.data.id}
                    votingDescriptor={idea.data.relationships.action_descriptor.data.voting}
                    projectId={projectId}
                  />

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
                      <T value={titleMultiloc} maxLength={50} >
                        {(title) => {
                          return (
                            <StyledSharing
                              twitterMessage={formatMessage(messages.twitterMessage, { ideaTitle: title })}
                              sharedContent="idea"
                              userId={authUser && authUser.data.id}
                            />);
                        }}
                      </T>
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
                </MetaContent>
              </RightColumnDesktop>
            </Content>
          </IdeaContainer>

          <Modal opened={this.state.spamModalVisible} close={this.closeSpamModal}>
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
            {loader}
          </Loading>
        </CSSTransition>

        <CSSTransition
          classNames="content"
          in={(opened && loaded)}
          timeout={contentTimeout + contentDelay}
          mountOnEnter={false}
          unmountOnExit={false}
          exit={true}
        >
          <Container>
            {content}
          </Container>
        </CSSTransition>
      </>
    );
  }
}

export default injectIntl(localize(IdeasShow));
