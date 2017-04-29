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
import styled from 'styled-components';
import _ from 'lodash';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { Saga } from 'react-redux-saga';

import { createUser } from './actions';
import messages from './messages';
import Form from './Form';
import makeSelectUsersNewPage from './selectors';
import { watchCreateUser, watchUserSignIn } from './sagas';

const SpinnerBox = styled.div`
  border: 1px solid yellow;
  margin-bottom: 20px;
`;

const ErrorBox = styled.div`
  border: 1px solid yellow;
  margin-bottom: 20px;
  color: red;
`;

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
    const self = this
    return (data) => {
      locale = this.props.userLocale
      return self.props.createUser(Object.assign({}, data, {locale}))
    };
  }

  render() {
    const { newUser, error, pending } = this.props.storeData;
    const { locale } = this.props.userLocale;
    const ErroMessages = (error && error.json) || {};
    console.log(newUser);
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
          errors={(error && error.json) || {}}
          pending={pending}
        />
      </div>
    );
  }
}

UsersNewPage.propTypes = {
  storeData: PropTypes.object,
  userLocale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  storeData: makeSelectUsersNewPage(),
  userLocale: makeSelectLocale(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ createUser }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(UsersNewPage);
