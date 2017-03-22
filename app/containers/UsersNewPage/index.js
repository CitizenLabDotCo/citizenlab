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

const fakeRegisterWithServer = (values) => {
  const id = Date.now().toString();
  const response = {
    data: {
      id,
      attributes: Object.assign({}, values, { id, password: undefined }),
    },
  };
  return new Promise((resolve) => setTimeout(() => resolve(response), 1000));
};

export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    fakeRegisterWithServer(values).then((response) => {
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
