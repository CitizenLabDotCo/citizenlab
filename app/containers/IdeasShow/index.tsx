import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';
import { Location } from 'history';

// components
import Meta from './components/show/Meta';
import VoteControl from 'components/VoteControl';
/*
import ImageCarousel from 'components/ImageCarousel';
import Author from './show/Author';
import StatusBadge from 'components/StatusBadge';
import CommentsLine from './show/CommentsLine';
import SharingLine from './show/SharingLine';
import Comments from './comments';
*/

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { ideaImagesStream, ideaImageStream, IIdeaImage, IIdeaImageData } from 'services/ideaImages';

// i18n
import T from 'components/T';
import { injectIntl, intlShape, FormattedMessage, FormattedRelative } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';


const Content = styled.div`
  width: 100%;
  max-width: 1050px;
  display: flex;
`;

const LeftColumn = styled.div`
  flex-grow: 1;
  padding: 55px;
`;

const SeparatorColumn = styled.div`
  flex: 0 0 3px;
  background: #eaeaea;
  margin: 40px 0;
  border: solid #fafafa 1px;
`;

const SeparatorRow = styled.div`
  height: 3px;
  background: #eaeaea;
  margin: 40px 0;
  border: solid #fafafa 1px;
`;

const RightColumn = styled.div`
  flex: 0 0 280px;
  padding: 40px;
`;

const IdeaTitle = styled.h1`
  font-size: 25px;
  padding-bottom: 1.5em;
`;

const IdeaBody = styled.div`
  font-size: 18px;
  color: #8f8f8f;
`;

const VoteCTA = styled.h3`
  font-size: 20px;
  font-weight: 400;
  color: #222222;
`;

const StatusContainer = styled.div`
  padding: 50px 0;
`;

const StatusTitle = styled.h4`
  font-size: 18px;
  color: #a6a6a6;
  font-weight: 400;
`;

const AuthorContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Avatar = styled.img`
  flex: 0 0 38px;
  height: 38px;
  border-radius: 50%;
`;

const AuthorName = styled(Link) `
  font-weight: bold;
  color: #484848;
  font-size: 16px;
  flex-grow: 1;
  padding-left: 12px;
`;

const Timing = styled.div`
  font-size: 14px;
  color: #a9a9a9;
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

export default class IdeasShow extends React.PureComponent<Props, State> {
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
      Rx.Observable.combineLatest(locale$, idea$).subscribe(([locale, { idea, ideaImage, ideaAuthor }]) => {
        this.setState({ locale, idea, ideaImage, ideaAuthor, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { locale, idea, ideaImage, ideaAuthor, loading } = this.state;

    if (!loading && idea !== null && ideaAuthor !== null) {
      const ideaSlug = idea.data.attributes.slug;
      const avatar = ideaAuthor.data.attributes.avatar.large;
      const firstName = ideaAuthor.data.attributes.first_name;
      const lastName = ideaAuthor.data.attributes.last_name;
      const createdAt = idea.data.attributes.created_at;
      const titleMultiloc = idea.data.attributes.title_multiloc;
      const bodyMultiloc = idea.data.attributes.body_multiloc;

      return (
        <div>
          <Meta location={location} slug={ideaSlug} />
          <Content id="e2e-idea-show">
            <LeftColumn>
              <AuthorContainer>
                <Avatar src={avatar} />
                <AuthorName to={`/profile/${ideaAuthor.data.attributes.slug}`}>
                  <FormattedMessage {...messages.byAuthor} values={{ firstName, lastName }} />
                </AuthorName>
                <Timing>
                  <FormattedRelative value={createdAt} />
                </Timing>
              </AuthorContainer>
              <IdeaTitle><T value={titleMultiloc} /></IdeaTitle>
              {/* <Carousel images={images.map((image) => image.attributes.versions)} /> */}
              <IdeaBody>
                <T value={bodyMultiloc} />
              </IdeaBody>
              <SeparatorRow />
              {/* <Comments ideaId={id} /> */}
            </LeftColumn>
            <SeparatorColumn />
            <RightColumn>
              <VoteCTA>
                <FormattedMessage {...messages.voteCTA} />
              </VoteCTA>
              <VoteControl ideaId={idea.data.id} />
              <StatusContainer>
                <StatusTitle><FormattedMessage {...messages.ideaStatus} /></StatusTitle>
                {/* <StatusBadge statusId={statusId} /> */}
              </StatusContainer>
              {/* <CommentsLine count={comments_count}/> */}
              {/* <SharingLine location={location} image={images[0] && images[0].attributes.versions.medium} /> */}
            </RightColumn>
          </Content>
        </div>
      );
    }

    return null;
  }
}
