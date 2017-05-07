/*
 *
 * UsersNewPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
// import { actions as rrfActions } from 'react-redux-form';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { Saga } from 'react-redux-saga';

import { createEmailUserRequest, createSocialUserRequest } from './actions';
import Form from './Form';
import makeSelectUsersNewPage from './selectors';
import { NETWORK_FACEBOOK } from './constants';
import { watchEmail, watchSocial } from './sagas';
import messages from './messages';


export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function


  onFacebookSubmit = () => {
    this.props.createSocialUserRequest(NETWORK_FACEBOOK, this.props.userLocale);
  }

  createUser = (data) => {
    this.props.createEmailUserRequest(Object.assign({}, data, { locale: this.props.userLocale }));
  }

  render() {
    const { error, pending } = this.props.storeData;
    const ErroMessages = (error && error.json) || {};
    return (
      <div>
        <Helmet
          title="UsersNewPage"
          meta={[
            { name: 'description', content: 'Description of UsersNewPage' },
          ]}
        />
        <Saga saga={watchEmail} />
        <Saga saga={watchSocial} />

        <Form
          createUser={this.createUser}
          getDispatch={(localFormDispatch) => (this.localFormDispatch = localFormDispatch)}
          errors={ErroMessages}
          pending={pending}
        >
        </Form>
        <div style={{ marginTop: '1em', width: '100%', display: 'block' }}>
          <button className="ui facebook button" onClick={this.onFacebookSubmit} style={{ width: '100%' }}>
            <i className="facebook icon"></i>
            <FormattedMessage {...messages.buttonRegisterFacebook} />
          </button>
        </div>
      </div>
    );
  }
}

UsersNewPage.propTypes = {
  storeData: PropTypes.object,
  userLocale: PropTypes.string.isRequired,
  createEmailUserRequest: PropTypes.func.isRequired,
  createSocialUserRequest: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  storeData: makeSelectUsersNewPage(),
  userLocale: makeSelectLocale(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createEmailUserRequest, createSocialUserRequest }, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(UsersNewPage);
