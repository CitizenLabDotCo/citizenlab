import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';
import { Location } from 'history';

// components
import VoteControl from 'components/VoteControl';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
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
import { ideaStatusesStream } from 'services/ideaStatuses';
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';

// i18n
import T from 'components/T';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div``;

const IdeaContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  width: 100%;
  max-width: 560px;
  margin-bottom: 50px;
  display: flex;
  justify-content: flex-start;
`;

const IdeaTitle = styled.h1`
  color: #444;
  font-size: 34px;
  font-weight: 500;
  line-height: 42px;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  border: solid 1px #e6e6e6;
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 25px;
`;

const IdeaBody = styled.div`
  color: #444;
  font-size: 19px;
  line-height: 26px;
  font-weight: 300;

  p {
    margin-bottom: 30px;
  }
`;

const SeparatorColumn = styled.div`
  flex: 0 0 1px;
  margin: 0;
  margin-left: 40px;
  margin-right: 40px;
  background: #e6e6e6;
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
      const ideaAuthor$ = userByIdStream(ideaAuthorId).observable;
      return Rx.Observable.combineLatest(ideaImage$, ideaAuthor$).map(([ideaImage, ideaAuthor]) => ({ idea, ideaImage, ideaAuthor }));
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

                <StyledAuthor authorId={authorId} createdAt={createdAt} />

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
