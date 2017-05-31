import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import IdeaCard from 'components/IdeaCard';
import { Card } from 'semantic-ui-react';

import messages from './messages';
import { makeSelectIdeas } from './selectors';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { LOAD_USER_IDEAS_REQUEST } from './constants';

// eslint-disable-next-line react/prop-types
const UserIdeasWrapper = ({ userIdeas }) => (<Card.Group stackable>{userIdeas.map((idea) => (
  <IdeaCard
    key={idea.id}
    id={idea.id}
    project={idea.relationships.project && idea.relationships.project.data.id}
  />
))}</Card.Group>);

function UserIdeas(props) {
  const { userIdeas, loadingUserIdeas, loadUserIdeasError } = props;

  return (
    <div className={props.className}>
      {/* STATUS MESSAGES */}
      {loadingUserIdeas && <FormattedMessage {...messages.loadingUserIdeas} />}
      {loadUserIdeasError && <FormattedMessage {...messages.loadUserIdeasError} />}
      {/* IDEAS */}
      <UserIdeasWrapper
        userIdeas={userIdeas}
      />
    </div>
  );
}

UserIdeas.propTypes = {
  className: PropTypes.string,
  loadingUserIdeas: PropTypes.bool,
  loadUserIdeasError: PropTypes.bool,
  userIdeas: PropTypes.any,
};

UserIdeasWrapper.PropTypes = {
  userIdeas: PropTypes.any.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userIdeas: makeSelectIdeas(),
  // here, rather than mergeProps, for correct re-render trigger
  loadingUserIdeas: (state) => state.getIn(['tempState', LOAD_USER_IDEAS_REQUEST, 'loading']),
  loadUserIdeasError: (state) => state.getIn(['tempState', LOAD_USER_IDEAS_REQUEST, 'error']),
});

export default styled(connect(mapStateToProps)(UserIdeas))`
  // none yet
`;
