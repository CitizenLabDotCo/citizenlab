import React from 'react';
import PropTypes from 'prop-types';

import { Grid, Image } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import messages from './messages';

import LinkTo from '../common/LinkTo';
import PostedAtLabel from '../common/PostedAtLabel';
import ClearNotification from '../common/ClearNotification';
import * as commentIcon from '../../assets/comment_icon.svg';
import StyledHr from '../common/StyledHr';
import StyledContainerRow from '../common/StyledContainerRow';
import LinkContainerStyled from '../common/LinkContainerStyled';

// HTML is invalid but doesn't affect SEO as notification menu is hidden by default, even if logged in
// nested a tags are necessary to have nested Router links
const CommentOnCommentNotification = ({ notification, clearNotification, locale, className }) => (<LinkContainerStyled
  to={`/ideas/${notification.relationships.idea.data.id}`}
  onClick={(evt) => { evt.stopPropagation(); }}
><Grid className={className} onClick={() => clearNotification(notification.id)}>
  <StyledContainerRow>
    <Grid.Column width={2}>
      <Image centered src={commentIcon} />
    </Grid.Column>
    <Grid.Column width={14} style={{ paddingRight: '25px' }}>
      {<LinkTo
        content={`${notification.attributes.user_first_name} ${notification.attributes.user_last_name}`}
        link={`/profile/${notification.attributes.user_slug}`}
      />}
      <FormattedMessage
        {...messages.body}
      />
      <PostedAtLabel
        createdAt={notification.attributes.created_at}
        locale={locale}
      />
      {!notification.attributes.read_at && <ClearNotification
        onClick={() => clearNotification(notification.id)}
      />}
    </Grid.Column>
    <StyledHr />
  </StyledContainerRow>
</Grid></LinkContainerStyled>);

CommentOnCommentNotification.propTypes = {
  notification: PropTypes.object.isRequired,
  clearNotification: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default styled(CommentOnCommentNotification)`
  font-weight: ${(props) => props.notification.attributes.read_at ? 'inherit' : 'bold'};
  width: calc(100% - 20px);
  margin: auto !important;
`;
