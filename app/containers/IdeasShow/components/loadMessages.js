
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import messages from '../messages';

import selectIdeasShowPageDomain from '../selectors';


const loadErrorMessage = ({ loadIdeaError }) => {
  if (!loadIdeaError) return null;
  return <FormattedMessage {...messages.loadIdeaError} />;
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
  return <FormattedMessage {...messages.loadingIdea} />;
};

loadingIdeaMessage.propTypes = {
  loadingIdea: PropTypes.bool.isRequired,
};

const loadingIdeaMessageMDP = createStructuredSelector({
  loadingIdea: selectIdeasShowPageDomain('loadingIdea'),
});

export const LoadingIdeaMessage = connect(loadingIdeaMessageMDP)(loadingIdeaMessage);
