import React from 'react';
import PropTypes from 'prop-types';

import Helmet from 'react-helmet';
import { injectTFunc } from 'containers/T/utils';

// components
import { Comment } from 'semantic-ui-react';
import ImageCarousel from 'components/ImageCarousel';
import Author from './common/author';
import Editor from './common/editor';
import Votes from './show/votes';
import Comments from './comments';
import T from 'containers/T';
import Autorize from 'utils/containers/authorize';
// import ShareButtons from './ShareButtons';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { makeSelectIdeaImages, selectIdea } from '../selectors';

// intl
import { injectIntl, intlShape } from 'react-intl';
import messages from './../messages';

const Carousel = ({ images }) => {
  if (!images[0]) return null;
  return <ImageCarousel ideaImages={images} />;
};

Carousel.propTypes = {
  images: PropTypes.array.isRequired,
};

/* eslint-disable */
class Show extends React.PureComponent {

  render() {
    const {
      id, idea, images, authorId, title_multiloc, body_multiloc, created_at, votes, voteId, location, tFunc } = this.props;
    const { formatMessage } = this.props.intl;

    if (!title_multiloc) return null;
    return(
      <div>
        <Helmet
          title={formatMessage(messages.helmetTitle)}
          meta={[
            { name: 'description', content: tFunc(title_multiloc) },
          ]}
        />
        <Carousel images={images} />
        <h2>
          <T value={title_multiloc} />
        </h2>
        {/* <ShareButtons location={location} image={images[0] && images[0].medium} /> */}
        <Votes ideaId={id} voteId={voteId} />
        <Comment.Group style={{ maxWidth: 'none' }}>
          <Comment>
            <Comment.Content>
            <Author authorId={authorId}>
              {created_at}
            </Author>
            <Comment.Text>
              <T value={body_multiloc} />
            </Comment.Text>
            <Autorize action={['comments', 'create']}>
              <Editor ideaId={id} />
            </Autorize>
            </Comment.Content>
          </Comment>
        </Comment.Group>

        <Comments />
        {/*<Info id={id} />*/}
      </div>
    );
  }

}

Show.propTypes = {
  id: PropTypes.string,
  tFunc: PropTypes.func,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  idea: selectIdea,
  images: makeSelectIdeaImages(),
});

/* eslint-disable camelcase*/

const mergeProps = ({ idea, images }, dispatchProps, { tFunc, location, intl }) => {
  if (!idea) return {
    intl,
  };

  const attributes = idea.get('attributes').toObject();
  const id = idea.get('id')
  const {
    body_multiloc,
    created_at,
    downvotes_count,
    title_multiloc,
    upvotes_count,
  } = attributes;
  const relationships = idea.get('relationships');

  const getIds = (val, key) => val.get('id');
  const authorId = relationships.getIn(['author', 'data', 'id'])
  const areas = relationships.getIn(['areas','data']).map(getIds)
  const topics = relationships.getIn(['topics','data']).map(getIds)
  const voteId = relationships.getIn(['user_vote','data', 0, 'id'])
  return {
    id,
    images: images && images.toJS(),
    body_multiloc,
    created_at,
    votes: downvotes_count + upvotes_count,
    title_multiloc,
    authorId,
    areas,
    topics,
    location,
    voteId,
    tFunc,
    intl,
  };

};


export default injectIntl(injectTFunc(preprocess(mapStateToProps, null, mergeProps)(Show)));

/*

    const { attributes, relationships } = idea;
    const authorId = relationships.author && relationships.author.id;


        { attributes.images && attributes.images.length > 0 && <ImageCarousel
          ideaImages={attributes.images}
        />}

        <IdeaContent>
          
        </IdeaContent>
        <Comments idea={idea} />
*/
