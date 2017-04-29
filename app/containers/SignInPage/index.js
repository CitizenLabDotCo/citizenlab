/*
 *
 * SignInPage
 *
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import {
  Button,
} from 'components/Foundation';
import makeSelectSignInPage from './selectors';
import messages from './messages';
import Form from './Form';
import { authenticateRequest } from './actions';
import socialAuth from '../../socialAuth';
import T from 'containers/T';

const Box = styled.div`
  padding: 20px;
  border: 1px solid #888;
  margin-bottom: 20px;
`;

// export const LoggedInAsBox = () => (
//   <Box>
//     { socialAuth('facebook').isLoggedIn() ? 'logged in? yes' : 'logged in? no' }
//   </Box>
// );

// export const SocialLoginBox = (props) => {
//     socialAuth('facebook').login().then(props.onChange);
//   };

//   const handleLogoutClick = () => {
//     socialAuth('facebook').logout();
//     props.onChange();
//   };

//   return (
//     <div>
//           <button className="ui facebook button" onClick={() => handleLoginClick()}>
//             <i className="facebook icon"></i>
//             Sign In With Facebook
//           </button>
//     </div>
//   );
// };

// TODO enable eslint
/* eslint-disable */
export class SignInPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  // Quick fix until we add a Saga
  // handleSubmit(values) {
  //   this.props.onSubmit()
  //
  //   console.log("[DEBUG] values =", values);
  //   Api.login(values.email, values.password)
  //     .then((json) => {
  //       console.log("[DEBUG] json =", json);
  //       try {
  //         window.localStorage.setItem('jwt', json.jwt)
  //         this.props.router.push('/');
  //       } catch (err) {
  //         console.log(err); // eslint-disable-line
  //       }
  //     });
  // }

  handleSocialLogin = () =>{
    ocialAuth('facebook').login().then(this.forceUpdate());
  }

  render() {
    return (
      <div>
        <Helmet
          title="SignInPage"
          meta={[
            { name: 'description', content: 'Description of SignInPage' },
          ]}
        />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <Form onSubmit={this.props.onSubmit} errors={{}} >
          <div style={{ marginTop: "1em", width: "100%", display: "block" }}>
            <button className="ui facebook button" onClick={this.handleLoginClick} style= {{ width: "100%" }}>
              <i className="facebook icon"></i>
              <T value={messages.facebookSignIn}/>
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

SignInPage.propTypes = {
  onSubmit: React.PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  SignInPage: makeSelectSignInPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (values) => dispatch(authenticateRequest(values)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInPage);
