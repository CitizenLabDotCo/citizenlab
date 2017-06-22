import React from 'react';
import PropTypes from 'prop-types';

import { Segment } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';
import messages from './messages';

const CommentOnCommentNotification = ({ tFunc, createdAt, userFirstName, userLastName, userSlug, ideaTitleMultiloc }) => (<Segment>
  <FormattedMessage
    {...messages.body}
    values={{
      createdAt,
      userFirstName,
      userLastName,
      userSlug,
      ideaTitleMultiloc: tFunc(ideaTitleMultiloc),
    }}
  />
</Segment>);

CommentOnCommentNotification.propTypes = {
  createdAt: PropTypes.string,
  userFirstName: PropTypes.string,
  userLastName: PropTypes.string,
  userSlug: PropTypes.string,
  ideaTitleMultiloc: PropTypes.
};

export default injectTFunc(styled(CommentOnCommentNotification) `
  content
`);