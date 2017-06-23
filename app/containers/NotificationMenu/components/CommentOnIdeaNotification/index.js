import React from 'react';
import PropTypes from 'prop-types';

import { Segment, Grid, Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import { injectTFunc } from 'containers/T/utils';
import styled from 'styled-components';
import messages from './messages';

import LinkTo from '../common/LinkTo';
import PostedAtLabel from '../common/PostedAtLabel';
import ClearNotification from '../common/ClearNotification';
import * as mentionIcon from '../../assets/mention_icon.svg';


const CommentOnIdeaNotification = ({ notification, tFunc, clearNotification, locale, className }) => (<Segment><Grid className={className}><Grid.Row>
  <Grid.Column width={2}>
    <Image centered src={mentionIcon} />
  </Grid.Column>
  <Grid.Column width={14} style={{ paddingRight: '25px' }}>
    {<LinkTo
      content={`${notification.attributes.user_first_name} ${notification.attributes.user_last_name}`}
      link={`/profile/${notification.attributes.user_slug}`}
    />}
    <FormattedMessage
      {...messages.body}
    />
    {<LinkTo
      content={tFunc(notification.attributes.idea_title)}
      link={`/ideas/${notification.relationships.idea.data.id}`}
    />}
    <PostedAtLabel
      createdAt={notification.attributes.created_at}
      locale={locale}
    />
    {!notification.attributes.read_at && <ClearNotification
      onClick={() => clearNotification(notification.id)}
    />}
  </Grid.Column>
</Grid.Row></Grid></Segment>);

CommentOnIdeaNotification.propTypes = {
  tFunc: PropTypes.func,
  notification: PropTypes.object.isRequired,
  clearNotification: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default injectTFunc(styled(CommentOnIdeaNotification)`
  font-weight: ${(props) => props.notification.attributes.read_at ? 'inherit' : 'bold'};
  opacity: ${(props) => props.notification.attributes.read_at ? '0.65' : '1'};
`);
