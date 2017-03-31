// TODO enable eslint
/* eslint-disable */
import hello from 'hellojs';
import Api from 'api';

hello.init({
  facebook: 1759232984393029,
});

hello.on('auth.login', (data) => {
  const network = data.network;
  const accessToken = data.authResponse.access_token;
  console.log("[DEBUG] network =", network);
  console.log("[DEBUG] access_token =", accessToken);

  Api.socialLogin(network, accessToken)
    .then((json) => {
      console.log("[DEBUG] json =", json);
      try {
        window.localStorage.setItem('jwt', json.jwt)
      } catch (err) {
        console.log(err); // eslint-disable-line
      }
    });
});

const socialAuth = (network) => ({
  login: () =>
    hello(network).login({ scope: 'email' }).then(() => {
      console.log('[DEBUG] logged in');
    }, (e) => {
      console.log('[DEBUG] login error: ' + e.error.message);
    }),

  logout: () =>
    hello(network).logout().then(() => {
      console.log('[DEBUG] logged out');
    }, (e) => {
      console.log('[DEBUG] logout error: ' + e.error.message);
    }),

  isLoggedIn: () => {
    const session = hello(network).getAuthResponse();
    const currentTime = (new Date()).getTime() / 1000;
    return session && session.access_token && session.expires > currentTime;
  },

});

export default socialAuth;
