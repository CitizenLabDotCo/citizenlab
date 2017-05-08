
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { Message, Icon } from 'semantic-ui-react'

import messages from '../messages';
import selectIdeasShowPageDomain from '../selectors';


const loadErrorMessage = ({ loadIdeaError }) => {
  if (!loadIdeaError) return null;
  return (
    <Message icon negative>
      <Icon name={'pointing right'} />
      <Message.Header>
        <FormattedMessage {...messages.ideaNotFound} />
      </Message.Header>
    </Message>
  );
};

loadErrorMessage.propTypes = {
  loadIdeaError: PropTypes.string,
};

const loadErrorMessageMDP = createStructuredSelector({
  loadIdeaError: selectIdeasShowPageDomain('loadIdeaError'),
});

export const LoadErrorMessage = connect(loadErrorMessageMDP)(loadErrorMessage);


const loadingIdeaMessage = ({ loadingIdea }) => {
  if (!loadingIdea) return null;
  return (
    <Message icon>
      <Icon name='circle notched' loading />
      <Message.Content>
        <Message.Header>Just one second
          <div>
            <FormattedMessage {...messages.loadingIdea} />
          </div>
        </Message.Header>
      </Message.Content>
    </Message>
  )
};

loadingIdeaMessage.propTypes = {
  loadingIdea: PropTypes.bool.isRequired,
};

const loadingIdeaMessageMDP = createStructuredSelector({
  loadingIdea: selectIdeasShowPageDomain('loadingIdea'),
});

export const LoadingIdeaMessage = connect(loadingIdeaMessageMDP)(loadingIdeaMessage);
