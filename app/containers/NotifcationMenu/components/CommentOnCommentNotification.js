import React from 'react';
import PropTypes from 'prop-types';

import { Segment } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';
import messages from './messages';
import { parseDate } from '../lib';

const CommentOnCommentNotification = ({ tFunc, attributes }) => (<Segment>
  <FormattedMessage
    {...messages.body}
    values={{
      when: parseDate(attributes.created_at),
      fullName: `${attributes.user_first_name}&nbsp;${attributes.user_last_name}`,
      ideaTitleMultiloc: tFunc(attributes.idea_title),
    }}
  />
  {/* TODO: add clickable slug based on notification.user_slug */}
</Segment>);

CommentOnCommentNotification.propTypes = {
  tFunc: PropTypes.func.isRequired,
  attributes: PropTypes.object.isRequired,
};

export default injectTFunc(styled(CommentOnCommentNotification)`
  // TODO
`);
