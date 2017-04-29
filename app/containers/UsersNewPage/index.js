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
// import { FormattedMessage } from 'react-intl';
// import { actions as rrfActions } from 'react-redux-form';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { Saga } from 'react-redux-saga';

import { createUser } from './actions';
import Form from './Form';
import makeSelectUsersNewPage from './selectors';
import { watchCreateUser, watchUserSignIn } from './sagas';


export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(values) {
    const valuesWithLocale = { ...values, locale: this.props.userLocale };
    this.props.createUser(valuesWithLocale);
  }

  createUser = (locale) => {
    const self = this;
    return (data) => self.props.createUser(Object.assign({}, data, { locale }));
  }

  render() {
    const { error, pending } = this.props.storeData;
    const { locale } = this.props.userLocale;
    const ErroMessages = (error && error.json) || {};
    return (
      <div>
        <Helmet
          title="UsersNewPage"
          meta={[
            { name: 'description', content: 'Description of UsersNewPage' },
          ]}
        />
        <Saga saga={watchCreateUser} />
        <Saga saga={watchUserSignIn} />

        <Form
          createUser={this.createUser(locale)}
          getDispatch={(localFormDispatch) => (this.localFormDispatch = localFormDispatch)}
          errors={ErroMessages}
          pending={pending}
        />
      </div>
    );
  }
}

UsersNewPage.propTypes = {
  storeData: PropTypes.object,
  userLocale: PropTypes.string,
  createUser: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  storeData: makeSelectUsersNewPage(),
  userLocale: makeSelectLocale(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createUser }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UsersNewPage);
