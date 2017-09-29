import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';
import { Location } from 'history';

// components
import Meta from './components/show/Meta';
import VoteControl from 'components/VoteControl';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import Sharing from './components/show/Sharing';
import CommentsLine from './components/show/CommentsLine';
import Comments from './components/comments';

/*
import ImageCarousel from 'components/ImageCarousel';
import Author from './show/Author';
import Comments from './comments';
*/

// services
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';
import { ideaStatusesStream } from 'services/ideaStatuses';

// i18n
import T from 'components/T';
import { injectIntl, intlShape, InjectedIntlProps, FormattedMessage, FormattedRelative } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div``;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: 850px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  max-width: 580px;
  margin-bottom: 40px;
`;

const IdeaTitle = styled.h1`
  color: #444;
  font-size: 30px;
  font-weight: 500;
  line-height: 36px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const Timing = styled.div`
  color: #84939d;
  font-size: 16px;
  font-weight: 400;
  margin-top: 5px;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
`;

const LeftColumn = styled.div`
  flex-grow: 1;
  margin: 0;
  padding: 0;
`;

const IdeaImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin: 0;
  padding: 0;
  margin-bottom: 30px;
`;

const AuthorContainer = styled.div`
  font-size: 16px;
  line-height: 19px;
  display: flex;
  align-items: center;
  margin-top: 0px;
  margin-bottom: 30px;
`;

const AuthorAvatar = styled(Avatar)`
  width: 30px;
  height: 30px;
  margin-right: 8px;
`;

const AuthorName = styled(Link) `
  color: #84939d;
  font-weight: 400;
  text-decoration: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

const IdeaBody = styled.div`
  color: #474747;
  font-size: 18px;
  line-height: 24px;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const SeparatorColumn = styled.div`
  flex: 0 0 1px;
  margin: 0;
  margin-left: 45px;
  margin-right: 45px;
  background: #e0e0e0;
`;

const SeparatorRow = styled.div`
  height: 3px;
  background: #eaeaea;
  margin: 40px 0;
  border: solid #fafafa 1px;
`;

const RightColumn = styled.div`
  flex: 0 0 210px;
  margin: 0;
  padding: 0;
`;

const StatusContainer = styled.div`
  margin-top: 40px;
`;

const StatusTitle = styled.h4`
  color: #a6a6a6;
  font-size: 17px;
  font-weight: 400;
  margin: 0;
  margin-bottom: 10px;
  padding: 0;
`;

const StyledSharing: any = styled(Sharing)`
  margin-top: 50px;
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
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));
      const ideaAuthor$ = userStream(ideaAuthorId).observable;
      return Rx.Observable.combineLatest(ideaImage$, ideaAuthor$).map(([ideaImage, ideaAuthor]) => ({ idea, ideaImage, ideaAuthor }));
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$, 
        idea$
      ).subscribe(([locale, { idea, ideaImage, ideaAuthor }]) => {
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

  render() {
    const { locale, idea, ideaImage, ideaAuthor, loading } = this.state;
    const { formatRelative } = this.props.intl;

    if (!loading && idea !== null && ideaAuthor !== null) {
      const ideaSlug = idea.data.attributes.slug;
      const authorId = ideaAuthor.data.id;
      const avatar = ideaAuthor.data.attributes.avatar.large;
      const firstName = ideaAuthor.data.attributes.first_name;
      const lastName = ideaAuthor.data.attributes.last_name;
      const createdAt = formatRelative(idea.data.attributes.created_at);
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const bodyMultiloc = idea.data.attributes.body_multiloc;
      const statusId = (idea.data.relationships.idea_status && idea.data.relationships.idea_status.data ? idea.data.relationships.idea_status.data.id : null);
      const ideaImageLarge = (ideaImage ? ideaImage.data.attributes.versions.large : null);
      const ideaImageMedium = (ideaImage ? ideaImage.data.attributes.versions.medium : null);

      return (
        <Container>
          <Meta location={location} slug={ideaSlug} />
          <IdeaContainer>
            <Header>
              <IdeaTitle>
                <T value={titleMultiloc} />
              </IdeaTitle>
              <Timing>
                {createdAt}
              </Timing>
            </Header>

            <Content>
              <LeftColumn>
                {ideaImageLarge ? <IdeaImage src={ideaImageLarge} /> : null}

                <AuthorContainer>
                  <AuthorAvatar userId={authorId} size="medium" onClick={this.goToUserProfile} />
                  <AuthorName to={`/profile/${ideaAuthor.data.attributes.slug}`}>
                    <FormattedMessage {...messages.byAuthor} values={{ firstName, lastName }} />
                  </AuthorName>
                </AuthorContainer>

                <IdeaBody>
                  <T value={bodyMultiloc} />
                </IdeaBody>

                <SeparatorRow />

                <Comments ideaId={idea.data.id} />
              </LeftColumn>

              <SeparatorColumn />

              <RightColumn>
                <VoteControl ideaId={idea.data.id} />

                {statusId &&
                  <StatusContainer>
                    <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
                    <StatusBadge statusId={statusId} />
                  </StatusContainer>
                }

                <StyledSharing imageUrl={ideaImageMedium} />

                {/* <CommentsLine count={idea.data.attributes.comments_count}/> */}
              </RightColumn>
            </Content>
          </IdeaContainer>
        </Container>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(IdeasShow);
