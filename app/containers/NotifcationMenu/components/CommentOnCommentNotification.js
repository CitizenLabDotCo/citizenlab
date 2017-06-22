import React from 'react';
import PropTypes from 'prop-types';

import { Segment, Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';
import messages from './messages';
import { parseDate } from '../lib';

import * as clearIcon from '../assets/clear_icon.png';

const CommentOnCommentNotification = ({ key, tFunc, attributes, clearNotification }) => (<Segment>
  <FormattedMessage
    {...messages.body}
    values={{
      when: parseDate(attributes.created_at),
      fullName: `${attributes.user_first_name}&nbsp;${attributes.user_last_name}`,
      ideaTitleMultiloc: tFunc(attributes.idea_title),
    }}
  />
  {/* TODO: add clickable slug based on notification.user_slug (split if from FormattedMessage - i.e. multiple formatted messages */}
  <Image
    onClick={() => clearNotification(key)}
    src={clearIcon}
  />
</Segment>);

CommentOnCommentNotification.propTypes = {
  key: PropTypes.string.isRequired,
  tFunc: PropTypes.func,
  attributes: PropTypes.object.isRequired,
  clearNotification: PropTypes.func.isRequired,
};

export default injectTFunc(styled(CommentOnCommentNotification)`
  // TODO
`);
