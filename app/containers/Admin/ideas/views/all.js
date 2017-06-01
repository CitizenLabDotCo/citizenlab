import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';

// components
import { FormattedMessage } from 'react-intl';
// import ActionButton from 'components/buttons/action.js';
import IdeasBorad from 'containers/IdeasIndexPage/pageView';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';

const AllIdeas = () => (
  <div>
    <h1>
      <FormattedMessage {...messages.headerIndex} />
    </h1>
    <IdeasBorad />
  </div>
);

AllIdeas.propTypes = {
  goTo: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

export default preprocess(null, { goTo: push })(AllIdeas);

