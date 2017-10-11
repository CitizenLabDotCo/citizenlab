import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import scrollToComponent from 'react-scroll-to-component';

// router
import { Link, browserHistory } from 'react-router';
import { Location } from 'history';

// components
import VoteControl from 'components/VoteControl';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import Icon from 'components/UI/Icon';
import Comments from './CommentsContainer';
import Sharing from './Sharing';
import CommentsLine from './CommentsLine';
import Author from './Author';
import IdeaMeta from './IdeaMeta';

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
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div``;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: 820px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 80px;
  padding-top: 80px;
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMinTablet`
    padding-left: 0px;
    padding-right: 0px;
  `}
`;

const Header = styled.div`
  width: 100%;
  max-width: 540px;
  margin-bottom: 45px;
  display: flex;
  justify-content: flex-start;

  ${media.smallerThanMaxTablet`
    margin-bottom: 30px;
  `}
`;

const IdeaTitle = styled.h1`
  color: #444;
  font-size: 32px;
  font-weight: 500;
  line-height: 42px;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

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
  /* flex-grow: 1; */
  margin: 0;
  padding: 0;
`;

const IdeaImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin: 0;
  padding: 0;
  margin-bottom: 20px;
  border: solid 1px #eee;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  margin-bottom: 30px;
  padding: 0;
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
  line-height: 19px;
  font-weight: 300;
  text-decoration: none;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const TimeAgo = styled.div`
  color: #999;
  font-size: 13px;
  line-height: 17px;
  font-weight: 300;
  margin-top: 2px;
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
  margin-left: 35px;
  margin-right: 35px;
  background: #e4e4e4;

  position: -webkit-sticky;
  position: sticky;
  top: 100px;
  align-self: flex-start;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const SeparatorRow = styled.div`
  width: 100%;
  height: 1px;
  margin: 0;
  margin-top: 40px;
  margin-bottom: 30px;
  background: #e4e4e4;
`;

const RightColumn = styled.div`
  flex: 0 0 160px;
  margin: 0;
  padding: 0;
`;

const RightColumnDesktop = RightColumn.extend`
  position: -webkit-sticky;
  position: sticky;
  top: 100px;
  align-self: flex-start;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const RightColumnMobile = RightColumn.extend`
  flex: 1;
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
  font-weight: 300;
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
  loading: boolean;
};

class IdeasShow extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      locale: null,
      idea: null,
      ideaAuthor: null,
      ideaImage: null,
      loading: true
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const initialState: State = { locale: null, idea: null, ideaAuthor: null, ideaImage: null, loading: true };
    const locale$ = localeStream().observable;
    const idea$ = ideaByIdStream(ideaId).observable.switchMap((idea) => {
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const ideaAuthorId = idea.data.relationships.author.data.id;
      const ideaStatusId = (idea.data.relationships.idea_status ? idea.data.relationships.idea_status.data.id : null);
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));
      const ideaAuthor$ = userByIdStream(ideaAuthorId).observable;
      const ideaStatus$ = (ideaStatusId ? ideaStatusStream(ideaStatusId).observable : Rx.Observable.of(null));
      return Rx.Observable.combineLatest(
        ideaImage$, 
        ideaAuthor$, 
        ideaStatus$
      ).map(([ideaImage, ideaAuthor]) => ({ idea, ideaImage, ideaAuthor }));
    });
    const comments$ = commentsForIdeaStream(ideaId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$, 
        idea$,
        comments$
      ).subscribe(([locale, { idea, ideaImage, ideaAuthor }, comments]) => {
        this.setState({ locale, idea, ideaImage, ideaAuthor, loading: false });
      })
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

  render() {
    const { locale, idea, ideaImage, ideaAuthor, loading } = this.state;
    const { formatRelative } = this.props.intl;

    if (!loading && idea !== null && ideaAuthor !== null) {
      const ideaSlug = idea.data.attributes.slug;
      const authorId = ideaAuthor.data.id;
      const avatar = ideaAuthor.data.attributes.avatar.large;
      const firstName = ideaAuthor.data.attributes.first_name;
      const lastName = ideaAuthor.data.attributes.last_name;
      const createdAt = idea.data.attributes.created_at;
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const bodyMultiloc = idea.data.attributes.body_multiloc;
      const statusId = (idea.data.relationships.idea_status && idea.data.relationships.idea_status.data ? idea.data.relationships.idea_status.data.id : null);
      const ideaImageLarge = (ideaImage ? ideaImage.data.attributes.versions.large : null);
      const ideaImageMedium = (ideaImage ? ideaImage.data.attributes.versions.medium : null);
      const ideaCommentsCount = idea.data.attributes.comments_count;

      const rightColumnContent = (
        <div>
          <VoteControl ideaId={idea.data.id} />

          {statusId &&
            <StatusContainer>
              <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
              <StatusBadge statusId={statusId} />
            </StatusContainer>
          }

          <StyledSharing imageUrl={ideaImageMedium} />

          <GiveOpinion onClick={this.scrollToCommentForm}>
            <IconWrapper>
              <Icon name="comments" />
            </IconWrapper>
            <GiveOpinionText>
              <FormattedMessage {...messages.commentsTitle} />
            </GiveOpinionText>
          </GiveOpinion>
        </div>
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

                <IdeaBody>
                  <T value={bodyMultiloc} />
                </IdeaBody>

                <SeparatorRow />

                <RightColumnMobile>
                  {rightColumnContent}
                </RightColumnMobile>

                <Comments ideaId={idea.data.id} />
              </LeftColumn>

              <SeparatorColumn />

              <RightColumnDesktop>
                {rightColumnContent}
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
