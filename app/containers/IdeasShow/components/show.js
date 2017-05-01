import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

import T from 'containers/T';
import ImageCarousel from 'components/ImageCarousel';

import IdeaContent from '../IdeaContent';
import { makeSelectIdea } from '../selectors';
import Comments from './comments';
// import CommentEditorWrapper from '../CommentEditorWrapper';


class Show extends React.Component {
  render() {
    const { idea } = this.props;
    if (!idea) return null;
    const { attributes, relationships } = idea;
    const authorId = relationships.author && relationships.author.id;

    if (!idea) return <h2>Idea Not Found :/</h2>;
    return (
      <div>
        { attributes.images && attributes.images.length > 0 && <ImageCarousel
          ideaImages={attributes.images}
        />}
        <h2>
          <T value={attributes.title_multiloc} />
        </h2>
        <p><strong>By: {authorId} </strong></p>
        <IdeaContent>
          <T value={attributes.body_multiloc} />
        </IdeaContent>
        <Comments idea={idea} />
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  idea: makeSelectIdea(),
});

Show.propTypes = {
  idea: PropTypes.object,
};

export default connect(mapStateToProps)(Show);
