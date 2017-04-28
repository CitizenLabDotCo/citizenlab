import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import IdeaCard from 'components/IdeaCard';
import { Label, Grid } from 'semantic-ui-react';

import messages from './messages';

// eslint-disable-next-line react/prop-types
const UserIdeasWrapper = ({ userIdeas, goToIdea }) => (<Grid.Row>{userIdeas.map((userIdea, index) => (
  <Grid.Column key={index}>
    <IdeaCard
      idea={userIdea}
      onClick={() => goToIdea(userIdea.id)}
    />
  </Grid.Column>
))}</Grid.Row>);

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
      <Grid columns={2} centered>
        <UserIdeasWrapper
          userIdeas={userIdeas}
          goToIdea={goToIdea}
        />
      </Grid>
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
