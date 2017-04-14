import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import IdeaCard from 'components/IdeaCard';
import { Row, Column } from 'components/Foundation';

import messages from './messages';

function UserIdeas(props) {
  const { loadingUserIdeas, loadUserIdeasError, userIdeas, goToIdea } = props;

  return (
    <div className={props.className}>
      {loadingUserIdeas && <FormattedMessage {...messages.loadingIdeas} />}
      {loadUserIdeasError && <div>{loadUserIdeasError}</div>}
      <Row data-equalizer>
        {userIdeas && userIdeas.map((idea) => (
          <Column key={idea.id} small={12} medium={4} large={3}>
            <IdeaCard
              idea={idea}
              onClick={() => goToIdea(idea.id)}
            />
          </Column>
        ))}
      </Row>
    </div>
  );
}

UserIdeas.propTypes = {
  className: PropTypes.string,
  loadingUserIdeas: PropTypes.bool.isRequired,
  loadUserIdeasError: PropTypes.string,
  userIdeas: PropTypes.any.isRequired,
  goToIdea: PropTypes.func.isRequired,
};

export default styled(UserIdeas)`
  // none yet
`;
