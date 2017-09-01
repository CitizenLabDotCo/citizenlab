import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { push } from 'react-router-redux';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link } from 'react-router';
import { stateStream, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';
import auth from 'services/auth';
import { observeIdea, IIdea } from 'services/ideas';
import { observeUser, IUser } from 'services/users';
import { observeIdeaImages, IIdeaImageData } from 'services/ideaImages';
import { observeLocale } from 'services/locale';
import styled, { keyframes } from 'styled-components';
import messages from './messages';

const IdeaContainer = styled(Link)`
  width: 100%;
  height: 400px;
  margin: 5px 5px 26px 5px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;
  position: relative;

  &:hover {
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);
  }
`;

const fadeIn = keyframes`
  0% { display:none ; opacity: 0; }
  1% { display: flex ; opacity: 0; }
  100% { display: flex ; opacity: 1; }
`;

const IdeaHoverBar = styled.div`
  background: rgba(0,0,0,0.65);
  height: 60px;
  position: absolute;
  top: 0;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #ffffff;
  padding: 20px;
  border-radius: 5px 5px 0 0;

  display: none;
  opacity: 0;

  ${IdeaContainer}:hover & {
    animation: ${fadeIn} 0.15s ease-out;
    display: flex;
    opacity: 1;
  }
`;

const CommentCount = styled.span`
  padding-left: 6px;
`;

const IdeaImage = styled.img`
  width: 100%;
  height: 168px;
  object-fit:cover;
  border-radius: 5px 5px 0 0;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

const IdeaFooter = styled.div`
  padding: 20px;
`;

const IdeaTitle = styled.h4`
  color: #222222;
  font-weight: bold;
  // Multi-line wrap, adapted from https://codepen.io/martinwolf/pen/qlFdp
  display: block; /* Fallback for non-webkit */
  display: -webkit-box;
  max-width: 400px;
  height: ${(props: any) => props.lines * props.lineHeight * props.fontSize}px; /* Fallback for non-webkit */
  margin: 0 auto;
  font-size: ${(props: any) => props.fontSize}px;
  line-height: ${(props: any) => props.lineHeight};
  -webkit-line-clamp: ${(props: any) => props.lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IdeaAuthor = styled.div`
  color: #6B6B6B;
  font-size: 16px;
  font-weight: 300;
  margin-top: 12px;
  // a {
  //   color: #6B6B6B;
  //   &:hover {
  //     color: #222222;
  //   }
  // }
`;

// We use <span> instead of Link, because the whole card is already
// a Link (more important for SEO) and <a> tags can not be nested
const AuthorLink = styled.span`
  color: #6B6B6B;
  &:hover {
    color: #222222;
  }
`;

type Props = {
  id: string;
  onClick: () => void;
};

type State = {
  idea: IIdea | null;
  author: IUser | null;
  isAuthenticated: boolean;
  image: IIdeaImageData | null;
  locale: string | null;
  loading: boolean;
};

const namespace = 'IdeaCard/index';

export default class IdeaCard extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    const initialState: State = {
      idea: null,
      author: null,
      isAuthenticated: false,
      image: null,
      locale: null,
      loading: true
    };
    this.state$ = stateStream.observe<State>(namespace, namespace, initialState);
    this.subscriptions = [];
  }

  componentWillMount() {
    const ideaId = this.props.id;

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(
        observeLocale(),

        auth.observeAuthUser().map(authUser => !_.isNull(authUser)),

        observeIdea(ideaId).observable.switchMap((idea) => {
          const authorId = idea.data.relationships.author.data.id;
          return observeUser(authorId).observable.map((author) => ({ idea, author }));
        }),

        observeIdeaImages(ideaId).observable.map(images => (images ? images.data[0] : null)),

        (locale, isAuthenticated, { idea, author }, image) => ({ locale, isAuthenticated, idea, author, image })
      ).subscribe(({ locale, isAuthenticated, idea, author, image }) => {
        this.state$.next({ locale, isAuthenticated, idea, author, image, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCardClick = (event) => {
    event.preventDefault();
    this.props.onClick();
  }

  onAuthorClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    this.props.push(`/profile/${this.props.authorSlug}`);
  }

  onVoteClick = () => {
    if (!this.props.isAuthenticated) {
      this.setState({
        showUnauthenticated: true,
      });
    }
    return this.props.isAuthenticated;
  }

  render() {
    const { idea, author, isAuthenticated, image, locale, loading } = this.state;
    const ideaImage = (image ? image.attributes.versions.small : null);
    // console.log(idea);

    return ((!loading && idea && author && locale) ? (
      <IdeaContainer onClick={this.onCardClick} to={`/ideas/${slug}`}>
        <IdeaHoverBar>
          <FormattedRelative value={createdAt} />
          <div>
            <Icon name="comment" />
            <CommentCount>{commentsCount}</CommentCount>
          </div>
        </IdeaHoverBar>
        <IdeaImage src={imageUrl || placeholder} />
        <IdeaContent>
          <IdeaTitle lines={2} lineHeight={1.4} fontSize={23}>
            <T value={title} />
          </IdeaTitle>
          <IdeaAuthor>
            <FormattedMessage
              {...messages.byAuthorLink}
              values={{
                authorLink: <AuthorLink onClick={this.onAuthorClick}>{authorName}</AuthorLink>,
              }}
            />
          </IdeaAuthor>
        </IdeaContent>
        {!showUnauthenticated &&
          <IdeaFooter>
            <VoteControl ideaId={ideaId} beforeVote={this.onVoteClick} />
          </IdeaFooter>
        }
        {showUnauthenticated && <UnAuthenticated />}
      </IdeaContainer>
    ) : null);
  }
}

/*
  onClick: PropTypes.func.isRequired,
  title: ImPropTypes.map,
  createdAt: PropTypes.string.isRequired,
  ideaId: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  authorId: PropTypes.string,
  authorSlug: PropTypes.string,
  authorName: PropTypes.string.isRequired,
  commentsCount: PropTypes.number,
  push: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
*/

/*
const IdeaCard = (props) => {
  return (
    <View {...props} />
  );
};

IdeaCard.propTypes = {
  title: ImPropTypes.map,
  createdAt: PropTypes.string,
  upvotesCount: PropTypes.number,
  downvotesCount: PropTypes.number,
  onClick: PropTypes.func,
  imageUrl: PropTypes.string,
  authorName: PropTypes.string,
  authorId: PropTypes.string,
  authorSlug: PropTypes.string,
  commentsCount: PropTypes.number,
};

const mapStateToProps = () => createStructuredSelector({
  idea: selectIdea,
  author: selectAuthor,
  images: selectIdeaImages,
  currentUser: makeSelectCurrentUser(),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { onClick } = ownProps;
  const { idea, images, author, currentUser } = stateProps;
  if (!idea) return {};
  const ideaId = idea.get('id');
  const attributes = idea.get('attributes');
  const slug = attributes.get('slug');
  const title = attributes.get('title_multiloc');
  const createdAt = attributes.get('published_at');
  const authorName = attributes.get('author_name');
  const authorId = author.get('id');
  const authorSlug = author.getIn(['attributes', 'slug']);
  const firstImage = images.first();
  const imageUrl = firstImage && firstImage.getIn(['attributes', 'versions', 'medium']);
  const commentsCount = attributes.get('comments_count');
  const isAuthenticated = !!currentUser;

  return {
    ideaId,
    slug,
    onClick,
    title,
    createdAt,
    imageUrl,
    authorName,
    authorId,
    authorSlug,
    commentsCount,
    isAuthenticated,
  };
};

export default preprocess(mapStateToProps, null, mergeProps)(IdeaCard);
*/
