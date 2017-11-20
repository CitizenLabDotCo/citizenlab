import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import scrollToComponent from 'react-scroll-to-component';
import * as bowser from 'bowser';

// router
import { Link, browserHistory } from 'react-router';
import { Location } from 'history';

// components
import VoteControl from 'components/VoteControl';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import Error from 'components/UI/Error';
import Icon from 'components/UI/Icon';
import Comments from './CommentsContainer';
import Sharing from './Sharing';
import Author from './Author';
import IdeaMeta from './IdeaMeta';
import Unauthenticated from './Unauthenticated';
import IdeaMap from './IdeaMap';
import Button from 'components/UI/Button';

// services
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';
import { ideaStatusStream } from 'services/ideaStatuses';
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';

// i18n
import T from 'components/T';
import { injectIntl, InjectedIntlProps, FormattedMessage, FormattedRelative } from 'react-intl';
import messages from './messages';

// style
import styled, { css } from 'styled-components';
import { media } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div``;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: 800px;
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

  ${media.smallerThanMaxTablet`
    padding-top: 20px;
  `}
`;

const Header = styled.div`
  width: 100%;
  max-width: 520px;
  margin-bottom: 45px;
  display: flex;
  justify-content: flex-start;

  ${media.smallerThanMaxTablet`
    margin-bottom: 30px;
  `}
`;

const IdeaTitle = styled.h1`
  color: #444;
  font-size: 34px;
  font-weight: 500;
  line-height: 42px;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    font-size: 28px;
    line-height: 34px;
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
  margin: 0;
  padding: 0;
`;

const IdeaImage = styled.img`
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.separation};
  margin: 0 0 2rem;
  padding: 0;
  width: 100%;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const AuthorAndAdressWrapper = styled.div`
  align-items: center;
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;

  ${AuthorContainer} {
    flex: 1;
  }

  @media (min-width: 450px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const LocationButton = styled(Button)`
  padding-right: 0;
`;

const StyledPositionIcon = styled(Icon)`
  height: 1em;
  margin-left: .5em;
`;

const MapWrapper = styled.div`
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.separation};
  height: 265px;
  margin-bottom: 2rem;
  overflow: hidden;
  transition: all .3s ease-out;

  &.hidden {
    height: 0;
    border-color: transparent;
    margin-bottom: 0;
  }
`;

const AuthorAvatar = styled(Avatar)`
  width: 31px;
  height: 31px;
  margin-right: 8px;
  margin-top: 0px;
`;

const AuthorMeta = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled(Link) `
  color: #333;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  text-decoration: none;

  &:hover {
    color: #333;
    text-decoration: underline;
  }

  ${media.smallerThanMaxTablet`
    font-size: 14px;
    line-height: 18px;
  `}
`;

const TimeAgo = styled.div`
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 2px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
  `}
`;

const IdeaBody = styled.div`
  color: #474747;
  font-size: 18px;
  line-height: 30px;
  font-weight: 400;

  p {
    margin-bottom: 25px;
  }
`;

const SeparatorColumn = styled.div`
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 1px;
  margin: 0;
  margin-left: 30px;
  margin-right: 30px;
  background: transparent;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const SeparatorRow = styled.div`
  width: 100%;
  height: 1px;
  margin: 0;
  margin-top: 45px;
  margin-bottom: 35px;
  background: #e4e4e4;
  background: #fff;

  ${media.smallerThanMaxTablet`
    margin-top: 25px;
    margin-bottom: 25px;
    background: #e4e4e4;
  `}
`;

const RightColumn = styled.div`
  flex: 0 0 160px;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop: any = RightColumn.extend`
  &.notSafari {
    position: sticky;
    top: 100px;
    align-self: flex-start;
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const RightColumnMobile = RightColumn.extend`
  flex: 1;
  margin: 0;
  margin-bottom: 25px;
  padding: 0;
  padding-bottom: 15px;
  border-bottom: solid 1px #e4e4e4;
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const MetaContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const VoteLabel = styled.div`
  color: #84939E;
  font-size: 15px;
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

const StatusTitle = styled.h4`
  color: #84939d;
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
`;

const SharingWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSharing: any = styled(Sharing)`
  margin-top: 45px;
  margin-bottom: 0px;
`;

const IconWrapper = styled.div`
  width: 30px;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  justify-content: flex-start;

  svg {
    width: 20px;
    fill: #84939E;
    transition: all 100ms ease-out;
  }
`;

const GiveOpinionText = styled.div`
  color: #84939E;
  font-size: 15px;
  font-weight: 400;
  white-space: nowrap;
  transition: all 100ms ease-out;
`;

const GiveOpinion = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 100ms ease-out;
  margin: 0;
  padding: 0;

  &:hover {
    ${IconWrapper} svg {
      fill: #333;
    }

    ${GiveOpinionText} {
      color: #333;
    }
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

type Props = {
  location: Location;
  ideaId: string;
};

type State = {
  locale: string | null;
  idea: IIdea | null;
  ideaAuthor: IUser | null;
  ideaImage: IIdeaImage | null;
  ideaComments: IComments | null;
  loading: boolean;
  unauthenticatedError: boolean;
  showMap: boolean;
};

class IdeasShow extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      idea: null,
      ideaAuthor: null,
      ideaImage: null,
      ideaComments: null,
      loading: true,
      unauthenticatedError: false,
      showMap: false,
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const comments$ = commentsForIdeaStream(ideaId).observable;
    const idea$ = ideaByIdStream(ideaId).observable.switchMap((idea) => {
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const ideaAuthorId = idea.data.relationships.author.data ? idea.data.relationships.author.data.id : null;
      const ideaStatusId = (idea.data.relationships.idea_status ? idea.data.relationships.idea_status.data.id : null);
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));
      const ideaAuthor$ = ideaAuthorId ? userByIdStream(ideaAuthorId).observable : Rx.Observable.of(null);
      const ideaStatus$ = (ideaStatusId ? ideaStatusStream(ideaStatusId).observable : Rx.Observable.of(null));

      return Rx.Observable.combineLatest(
        ideaImage$,
        ideaAuthor$,
        ideaStatus$
      ).map(([ideaImage, ideaAuthor]) => ({ idea, ideaImage, ideaAuthor }));
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        idea$
      ).subscribe(([locale, { idea, ideaImage, ideaAuthor }]) => {
        this.setState({ locale, idea, ideaImage, ideaAuthor, loading: false });
      }),

      comments$.subscribe(ideaComments => this.setState({ ideaComments }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToUserProfile = () => {
    const { ideaAuthor } = this.state;

    if (ideaAuthor) {
      browserHistory.push(`/profile/${ideaAuthor.data.attributes.slug}`);
    }
  }

  unauthenticatedVoteClick = () => {
    this.setState({ unauthenticatedError: true });
  }

  scrollToCommentForm = (event) => {
    event.preventDefault();

    const element = document.querySelector('.ideaCommentForm');

    if (element) {
      const textarea = element.querySelector('textarea');

      if (textarea) {
        textarea.focus();
      }

      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  handleMapToggle = () => {
    this.setState({ showMap: !this.state.showMap });
  }

  render() {
    const { locale, idea, ideaImage, ideaAuthor, ideaComments, loading, unauthenticatedError } = this.state;
    const { formatMessage, formatRelative } = this.props.intl;

    if (!loading && idea !== null && ideaAuthor !== null) {
      const authorId = ideaAuthor.data.id;
      const firstName = ideaAuthor.data.attributes.first_name;
      const lastName = ideaAuthor.data.attributes.last_name;
      const createdAt = idea.data.attributes.created_at;
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const bodyMultiloc = idea.data.attributes.body_multiloc;
      const statusId = (idea.data.relationships.idea_status && idea.data.relationships.idea_status.data ? idea.data.relationships.idea_status.data.id : null);
      const ideaImageLarge = (ideaImage && _.has(ideaImage, 'data.attributes.versions.large') ? ideaImage.data.attributes.versions.large : null);
      const ideaImageMedium = (ideaImage && _.has(ideaImage, 'data.attributes.versions.medium') ? ideaImage.data.attributes.versions.medium : null);
      const isSafari = bowser.safari;
      const ideaLocation = idea.data.attributes.location_point_geojson || null;
      const ideaAdress = idea.data.attributes.location_description || null;

      const ideaMetaContent = (
        <MetaContent>
          <VoteLabel>{formatMessage(messages.voteOnThisIdea)}</VoteLabel>

          {!unauthenticatedError &&
            <VoteControl ideaId={idea.data.id} unauthenticatedVoteClick={this.unauthenticatedVoteClick} />
          }

          {unauthenticatedError && <Unauthenticated />}

          {statusId &&
            <StatusContainer>
              <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
              <StatusBadge statusId={statusId} />
            </StatusContainer>
          }

          <SharingWrapper>
            <StyledSharing imageUrl={ideaImageMedium} />

            <GiveOpinion onClick={this.scrollToCommentForm}>
              <IconWrapper>
                <Icon name="comments" />
              </IconWrapper>
              <GiveOpinionText>
                <FormattedMessage {...messages.commentsTitle} />
              </GiveOpinionText>
            </GiveOpinion>
          </SharingWrapper>
        </MetaContent>
      );

      return (
        <Container>
          <IdeaMeta ideaId={idea.data.id} />

          <IdeaContainer id="e2e-idea-show">
            <Header>
              <IdeaTitle>
                <T value={titleMultiloc} />
              </IdeaTitle>
            </Header>

            <Content>
              <LeftColumn>
                {ideaImageLarge ? <IdeaImage src={ideaImageLarge} /> : null}

                <AuthorAndAdressWrapper>
                  <AuthorContainer>
                    <AuthorAvatar userId={authorId} size="small" onClick={this.goToUserProfile} />
                    <AuthorMeta>
                      <AuthorName to={`/profile/${ideaAuthor.data.attributes.slug}`}>
                        <FormattedMessage {...messages.byAuthor} values={{ firstName, lastName }} />
                      </AuthorName>
                      {createdAt &&
                        <TimeAgo>
                          <FormattedRelative value={createdAt} />
                        </TimeAgo>
                      }
                    </AuthorMeta>
                  </AuthorContainer>

                  {ideaLocation && <LocationButton style="text" onClick={this.handleMapToggle}>
                    {(this.state.showMap) &&
                      <span>
                        <FormattedMessage {...messages.closeMap} />
                        <StyledPositionIcon name="close" />
                      </span>
                    }
                    {(!this.state.showMap) &&
                      <span>
                        {ideaAdress}
                        <StyledPositionIcon name="position" />
                      </span>
                    }
                  </LocationButton>}
                </AuthorAndAdressWrapper>

                {ideaLocation ? <MapWrapper className={`${this.state.showMap ? '' : 'hidden'}`}>
                  <IdeaMap location={ideaLocation} />
                </MapWrapper> : null}

                <IdeaBody>
                  <T value={bodyMultiloc} />
                </IdeaBody>

                <SeparatorRow />

                <RightColumnMobile>
                  {ideaMetaContent}
                </RightColumnMobile>

                {ideaComments && <Comments ideaId={idea.data.id} />}
              </LeftColumn>

              <SeparatorColumn />

              <RightColumnDesktop className={!isSafari ? 'notSafari' : ''}>
                {ideaMetaContent}
              </RightColumnDesktop>
            </Content>
          </IdeaContainer>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(IdeasShow);
