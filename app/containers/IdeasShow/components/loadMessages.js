import React from 'react';
import PropTypes from 'prop-types';

// Components
import { Message, Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

// Store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { LOAD_IDEA_REQUEST } from '../constants';

// messages
import messages from '../messages';


const ErrorMessage = () => (
  <Message icon negative>
    <Icon name={'pointing right'} />
    <Message.Header>
      <FormattedMessage {...messages.ideaNotFound} />
    </Message.Header>
  </Message>
);


const LoadingMessage = () => (
  <Message icon>
    <Icon name={'circle notched'} loading />
    <Message.Content>
      <Message.Header>
        <FormattedMessage {...messages.oneSecond} />
        <div>
          <FormattedMessage {...messages.loadingIdea} />
        </div>
      </Message.Header>
    </Message.Content>
  </Message>
);

const TempMessages = ({ loading, error }) => {
  if (loading) {
    return <LoadingMessage />;
  } else if (error) {
    return <ErrorMessage />;
  }
  return null;
};

TempMessages.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  loading: (state) => state.getIn(['tempState', LOAD_IDEA_REQUEST, 'loading']),
  error: (state) => state.getIn(['tempState', LOAD_IDEA_REQUEST, 'error']),
});

export default connect(mapStateToProps)(TempMessages);
