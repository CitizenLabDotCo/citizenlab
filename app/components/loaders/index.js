import React from 'react';
import PropTypes from 'prop-types';

// Components
import { Message, Icon } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';

// Store
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

// messages
import messages from './messages';


const ErrorMessage = ({ errorMessage }) => (
  <Message icon negative>
    <Icon name={'pointing right'} />
    <Message.Header>
      <FormattedMessage {...errorMessage} />
    </Message.Header>
  </Message>
);

ErrorMessage.propTypes = {
  errorMessage: PropTypes.object.isRequired,
};


const LoadingMessage = ({ loadingMessage }) => (
  <Message icon>
    <Icon name={'circle notched'} loading />
    <Message.Content>
      <Message.Header>
        <FormattedMessage {...messages.oneSecond} />
        <div>
          <FormattedMessage {...loadingMessage} />
        </div>
      </Message.Header>
    </Message.Content>
  </Message>
);

LoadingMessage.propTypes = {
  loadingMessage: PropTypes.object.isRequired,
};


// possible states in order of time (Initial, loading, error )
// 100 => Render Loading
// 010 => Render Loading
// 000 => Render child
// 001 => Render Error

class TempMessages extends React.Component {
  constructor() {
    super();
    this.state = { initial: true };
  }

  componentDidMount() {
    this.props.resourceLoader();
  }

  componentWillReceiveProps() {
    if (this.state.initial) {
      this.setState({ initial: false });
    }
  }

  render() {
    const { initial } = this.state;
    const { loading, error, loadingMessage, errorMessage } = this.props;
    console.log(initial, loading, error);
    if (loading || initial) {
      return <LoadingMessage loadingMessage={loadingMessage} />;
    } else if (error) {
      return <ErrorMessage errorMessage={errorMessage} />;
    }
    return this.props.children;
  }
}

TempMessages.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.bool,
  loadingMessage: PropTypes.object.isRequired,
  errorMessage: PropTypes.object.isRequired,
  children: PropTypes.object,
  resourceLoader: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: (state, { listenenTo }) => state.getIn(['tempState', listenenTo, 'loading']),
  error: (state, { listenenTo }) => state.getIn(['tempState', listenenTo, 'error']),
});

export default connect(mapStateToProps)(TempMessages);
