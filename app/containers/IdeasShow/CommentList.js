/**
*
* CommentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Comment from './Comment';

export const Comments = (props) => (<span>
  {props.comments.map((comment) =>
    (<div key={comment.id}>
      <Comment
        commentContent={comment.attributes.body_multiloc}
        parentId={comment.relationships.parent.id}
        createdAt={comment.attributes.created_at}
        modifiedAt={comment.attributes.modified_at}
      />
    </div>)
  )}
</span>);

class CommentList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      comments: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      comments: nextProps.comments,
    });
  }

  render() {
    const { comments, className } = this.props;

    return (
      <div className={className}>
        <Comments comments={comments} />
      </div>
    );
  }
}

CommentList.propTypes = {
  comments: PropTypes.any.isRequired,
  className: PropTypes.string,
};

Comments.propTypes = {
  comments: PropTypes.any.isRequired,
};

export default styled(CommentList)`
    // no style yet
`;
