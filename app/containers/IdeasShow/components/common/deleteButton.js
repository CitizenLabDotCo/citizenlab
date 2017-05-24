import React from 'react';
import PropTypes from 'prop-types';
import LoaderButton from 'components/buttons/loader.js';

// components
import { preprocess } from 'utils';

import { deleteCommentRequest } from '../../actions';
import messages from '../../messages';

class DeleteButton extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  handleClick = () => {
    this.setState({ loading: true }, () => {
      this.props.removeComment();
    });
  }

  render() {
    const { loading } = this.state;
    return (
      <LoaderButton
        fluid={false}
        size={'medium'}
        style={{ float: 'right' }}
        onClick={this.handleClick}
        message={messages.deleteComment}
        loading={loading}
      />
    );
  }
}

DeleteButton.propTypes = {
  removeComment: PropTypes.func,
};


const mapDispatchToProps = (dispatch, { commentId, ideaId }) => ({
  removeComment: () => dispatch(deleteCommentRequest(commentId, ideaId)),
});

export default preprocess(null, mapDispatchToProps)(DeleteButton);

