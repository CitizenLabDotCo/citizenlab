/*
 *
 * UsersNewPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { actions as rrfActions } from 'react-redux-form';
import { loadCurrentUser } from './../App/actions';
import messages from './messages';
import Form from './Form';

const createUser = (values) => (
  // TODO: remove hardcoded address
  fetch('http://localhost:4000/api/v1/users', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ user: values }),
  })
  .then((res) => res.json())
);

export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    createUser(values).then((response) => {
      // reset form
      this.localFormDispatch(rrfActions.reset('registration'));
      this.props.dispatch(loadCurrentUser(response.data));
    });
  }

  render() {
    const currentUser = this.props.currentUser;
    return (
      <div>
        <Helmet
          title="UsersNewPage"
          meta={[
            { name: 'description', content: 'Description of UsersNewPage' },
          ]}
        />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <p style={{ marginBottom: '20px' }}>CurrentUser: { currentUser ? currentUser.attributes.name : 'null' }</p>

        <Form
          onSubmit={this.handleSubmit}
          getDispatch={(localFormDispatch) => (this.localFormDispatch = localFormDispatch)}
        />
      </div>
    );
  }
}

UsersNewPage.propTypes = {
  currentUser: PropTypes.any,
  dispatch: PropTypes.func,
};

const mapStateToProps = (state) => ({
  currentUser: state.get('persistedData').toJS().currentUser,
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersNewPage);
