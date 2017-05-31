/*
 *
 * UsersShowPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import HelmetIntl from 'components/HelmetIntl';
import IdeaCards from 'containers/IdeasIndexPage/pageView';
import { Container } from 'semantic-ui-react';
import Avatar from './Avatar';
import T from 'containers/T';

// messages
import messages from './messages';

// store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';

export class UsersShowPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { user, params } = this.props;
    const attributes = user.get('attributes');
    const lastName = attributes.get('last_name');
    const firstName = attributes.get('last_name');
    const bio = attributes.get('bio');
    const avatarURL = attributes.getIn(['avatar', 'medium']);

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Container fluid textAlign="center">
          {/* AVATAR */}
          <Avatar avatarURL={avatarURL} />
          {/* USER INFORMATION */}
          <div>
            <div>{firstName}&nbsp;{lastName}</div>
            {bio && <T value={bio} />}
          </div>
          {/* USER IDEAS */}
          <IdeaCards filter={{ author: params.slug }} />
        </Container>
      </div>
    );
  }
}

UsersShowPage.propTypes = {
  params: PropTypes.object,
  user: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  user: makeSelectCurrentUserImmutable(),
});


export default connect(mapStateToProps)(UsersShowPage);
