/*
 *
 * UsersPasswordRecovery
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import WatchSagas from 'containers/WatchSagas';
import { createStructuredSelector } from 'reselect';
import TextInput from 'components/forms/inputs/text';
import Button from 'components/buttons/loader';
import { Form } from 'semantic-ui-react';
import * as emailValidator from 'email-validator';

import sagas from './sagas';
import selectUsersPasswordRecovery from './selectors';
import messages from './messages';
import { sendRecoveryLinkRequest } from './actions';


export class UsersPasswordRecovery extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      email: '',
      invalidEmail: false,
    };

    // provide context to bindings
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (name, value) => {
    if (name === 'email') {
      this.setState({
        invalidEmail: !emailValidator.validate(value),
      });
    }

    this.setState({
      [name]: value,
    });
  };

  handleSubmit(e) {
    e.preventDefault();

    const { email, invalidEmail } = this.state;

    if (email.length > 0 && !invalidEmail) {
      this.props.sendRecoveryLinkRequest(email);
    }
  }

  render() {
    const { processing, sent, notFoundError } = this.props;
    const { invalidEmail } = this.state;

    return (
      <div>
        <Helmet
          title="UsersPasswordRecovery"
          meta={[
            { name: 'description', content: 'Recover your password' },
          ]}
        />
        <WatchSagas sagas={sagas} />
        <FormattedMessage {...messages.header} />

        {sent && <div><FormattedMessage {...messages.sent} /></div>}
        <Form onSubmit={this.handleSubmit} error={!!notFoundError} >
          <TextInput name={'email'} action={this.handleChange} />
          <Button message={messages.submit} loading={processing} />
        </Form>

        {notFoundError && <div><FormattedMessage {...messages.notFoundError} /></div>}
        {invalidEmail && <div><FormattedMessage {...messages.invalidEmail} /></div>}
      </div>
    );
  }
}

UsersPasswordRecovery.propTypes = {
  notFoundError: PropTypes.bool.isRequired,
  processing: PropTypes.bool.isRequired,
  sent: PropTypes.bool.isRequired,
  sendRecoveryLinkRequest: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectUsersPasswordRecovery,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  sendRecoveryLinkRequest,
}, dispatch);

const mergeProps = ({ pageState }, dispatchProps) => ({
  processing: pageState.get('processing'),
  notFoundError: pageState.get('notFoundError'),
  sent: pageState.get('sent'),
  ...dispatchProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(UsersPasswordRecovery);
