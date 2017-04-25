/*
 *
 * UsersNewPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
    this.props.dispatch(createUser(valuesWithLocale));
    // TODO: reset form after saga
    // this.localFormDispatch(rrfActions.reset('registration'));
  }

  render() {
    const { newUser, error, pending } = this.props.storeData;
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
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        { pending === true && (<SpinnerBox>Please wait...</SpinnerBox>) }
        { error !== null && (
          <ErrorBox>
            <strong>An Error Occurred!</strong>
            {/* TODO: fix */}
            { _.map(error.json, (msg, key) => (
              <p key={key}>{key}: {msg.join(', ')}</p>
            )) }
          </ErrorBox>
          ) }

        <p style={{ marginBottom: '20px' }}>NewUser: { _.has(newUser, 'data.attributes') ? newUser.data.attributes.name : 'null' }</p>

        <Form
          onSubmit={this.handleSubmit}
          getDispatch={(localFormDispatch) => (this.localFormDispatch = localFormDispatch)}
        />
      </div>
    );
  }
}

UsersNewPage.propTypes = {
  newUser: PropTypes.any,
  dispatch: PropTypes.func,
  storeData: PropTypes.object,
  userLocale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  storeData: makeSelectUsersNewPage(),
  userLocale: makeSelectLocale(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersNewPage);
