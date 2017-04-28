import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import IdeaCard from 'components/IdeaCard';
import { Label, Card, Segment } from 'semantic-ui-react';

import messages from './messages';

// eslint-disable-next-line react/prop-types
const UserIdeasWrapper = ({ userIdeas, goToIdea }) => (<Segment basic>
  <Card.Group itemsPerRow={4} doubling stackable>{userIdeas.map((userIdea) => (
    <IdeaCard
      idea={userIdea}
      onClick={() => goToIdea(userIdea.id)}
    />
  ))}
  </Card.Group>
</Segment>);

function UserIdeas(props) {
  const { loadingUserIdeas, loadUserIdeasError, userIdeas, goToIdea } = props;

  return (
    <div className={props.className}>
      {loadingUserIdeas && <Label>
        <FormattedMessage {...messages.loadingIdeas} />
      </Label>}
      {loadUserIdeasError && <Label>
        {loadUserIdeasError}
        </Label>}
      <UserIdeasWrapper
        userIdeas={userIdeas}
        goToIdea={goToIdea}
      />
    </div>
  );
}

UserIdeas.propTypes = {
  className: PropTypes.string,
  loadingUserIdeas: PropTypes.bool.isRequired,
  loadUserIdeasError: PropTypes.string,
  userIdeas: PropTypes.any,
  goToIdea: PropTypes.func.isRequired,
};

UserIdeasWrapper.PropTypes = {
  userIdeas: PropTypes.any.isRequired,
  goToIdea: PropTypes.func.isRequired,
};

export default styled(UserIdeas)`
  // none yet
`;
