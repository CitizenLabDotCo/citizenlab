/*
 *
 * LoginPage
 *
 */

// TODO enable eslint
/* eslint-disable */
import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import makeSelectLoginPage from './selectors';
import messages from './messages';
import { Button } from '../../components/Foundation';
import SocialLoginBox from './SocialLoginBox';
import LoggedInAsBox from './LoggedInAsBox';

export class LoginPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="LoginPage"
          meta={[
            { name: 'description', content: 'Description of LoginPage' },
          ]}
        />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <LoggedInAsBox />

        <SocialLoginBox onChange={() => this.forceUpdate()} />
      </div>
    );
  }
}

LoginPage.propTypes = {
};

const mapStateToProps = createStructuredSelector({
  LoginPage: makeSelectLoginPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
