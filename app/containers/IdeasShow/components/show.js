import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { Comment } from 'semantic-ui-react';

import T from 'containers/T';
import ImageCarousel from 'components/ImageCarousel';
import Autorize from 'utils/containers/authorize';

import { selectIdea } from '../selectors';

import Author from './common/author';
import Editor from './common/editor';

import Votes from './show/votes';

import Comments from './comments';

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
      id, idea, images, authorId, title_multiloc,
      body_multiloc, created_at, votes } = this.props;
    if (!title_multiloc) return null;
    return(
      <div>
        <Carousel images={images} />
        <h2>
          <T value={title_multiloc} />
        </h2>
        <Votes ideaId={id} />
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
};

const mapStateToProps = createStructuredSelector({
  idea: selectIdea,
});

/* eslint-disable camelcase*/

const mergeProps = ({ idea }, dispatchProps) => {
  if (!idea) return {};
  const attributes = idea.get('attributes').toObject();
  const id = idea.get('id')
  const {
    images,
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
  return {
    id,
    images: images.toJS(),
    body_multiloc,
    created_at,
    votes: downvotes_count + upvotes_count,
    title_multiloc,
    authorId,
    areas,
    topics,
  };

};


export default preprocess(mapStateToProps, null, mergeProps)(Show);

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
