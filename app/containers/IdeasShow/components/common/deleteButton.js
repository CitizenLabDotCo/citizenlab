import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { preprocess } from 'utils';
import { FormattedMessage } from 'react-intl';

import { deleteComment } from '../../actions';
import messages from '../../messages';

const DeleteButton = ({ removeComment }) => (
  <Button style={{ float: 'right' }} onClick={removeComment}>
    <FormattedMessage {...messages.deleteComment} />
  </Button>
  );

DeleteButton.propTypes = {
  removeComment: PropTypes.func,
};


const mapDispatchToProps = (dispatch, { commentId, ideaId }) => ({
  removeComment: () => dispatch(deleteComment(commentId, ideaId)),
});

export default preprocess(null, mapDispatchToProps)(DeleteButton);

