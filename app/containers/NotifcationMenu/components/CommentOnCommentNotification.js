import React from 'react';
import PropTypes from 'prop-types';

import { Segment, Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';
import messages from './messages';

import * as clearIcon from '../assets/clear_icon.png';
import UserMention from './common/UserMention';
import PostedAtLabel from './common/PostedAtLabel';

const CommentOnCommentNotification = ({ id, tFunc, attributes, clearNotification, locale }) => (<Segment>
  {<UserMention
    fullName={`${attributes.user_first_name} ${attributes.user_last_name}`}
    slug={attributes.user_slug}
  />}
  <FormattedMessage
    {...messages.body}
    values={{
      ideaTitleMultiloc: tFunc(attributes.idea_title),
    }}
  />
  <PostedAtLabel
    createdAt={attributes.created_at}
    locale={locale}
  />
  <Image
    onClick={() => clearNotification(id)}
    src={clearIcon}
  />
</Segment>);

CommentOnCommentNotification.propTypes = {
  id: PropTypes.string.isRequired,
  tFunc: PropTypes.func,
  attributes: PropTypes.object.isRequired,
  clearNotification: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
};

export default injectTFunc(styled(CommentOnCommentNotification)`
  // TODO
`);
