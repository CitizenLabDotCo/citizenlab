/*
 *
 * UsersPasswordReset
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import HelmetIntl from 'components/HelmetIntl';
import { FormattedMessage } from 'react-intl';
import WatchSagas from 'containers/WatchSagas';
import { createStructuredSelector } from 'reselect';
import TextInput from 'components/forms/inputs/text';
import Button from 'components/buttons/loader';
import { Form } from 'semantic-ui-react';

import sagas from './sagas';
import selectUsersPasswordReset from './selectors';
import messages from './messages';
import { resetPasswordRequest } from './actions';


export class UsersPasswordReset extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      password: '',
      invalidPassword: false,
    };

    // provide context to bindings
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = (name, value) => {
    if (name === 'password') {
      this.setState({
        invalidPassword: value.length < 8,
      });
    }

    this.setState({
      [name]: value,
    });
  };

  handleSubmit(e) {
    e.preventDefault();

    const { query } = this.props.location;
    const { token } = query;
    const { password, invalidPassword } = this.state;

    if (password.length > 0 && !invalidPassword) {
      this.props.resetPasswordRequest(password, token);
    }
  }

  render() {
    const { processing, sent, error } = this.props;
    const { invalidPassword } = this.state;

    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagas} />
        <FormattedMessage {...messages.header} />

        {sent && <div><FormattedMessage {...messages.sent} /></div>}
        <Form onSubmit={this.handleSubmit} error={!!error} >
          <TextInput name={'password'} action={this.handleChange} />
          <Button message={messages.submit} loading={processing} />
        </Form>

        {error && <div><FormattedMessage {...messages.error} /></div>}
        {invalidPassword && <div>
          <FormattedMessage {...messages.invalidPassword} values={{ minPassLength: 8 }} />
        </div>}
      </div>
    );
  }
}

UsersPasswordReset.propTypes = {
  error: PropTypes.bool.isRequired,
  processing: PropTypes.bool.isRequired,
  sent: PropTypes.bool.isRequired,
  resetPasswordRequest: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectUsersPasswordReset,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  resetPasswordRequest,
}, dispatch);

const mergeProps = ({ pageState }, dispatchProps, { location }) => ({
  processing: pageState.get('processing'),
  error: pageState.get('error'),
  sent: pageState.get('sent'),
  location,
  ...dispatchProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(UsersPasswordReset);
