import hello from 'hellojs';

hello.init({
  facebook: 1759232984393029,
}, { redirect_uri: '/login' });


const socialAuth = (network) => ({
  login: () =>
    hello(network).login({ scope: 'email' }).then(() => {
      console.log('[DEBUG] logged in'); // eslint-disable-line
    }, (e) => {
      console.log('[DEBUG] login error: ' + e.error.message); // eslint-disable-line
    }),

  logout: () =>
    hello(network).logout().then(() => {
      console.log('[DEBUG] logged out'); // eslint-disable-line
    }, (e) => {
      console.log('[DEBUG] logout error: ' + e.error.message); // eslint-disable-line
    }),

  isLoggedIn: () => {
    const session = hello(network).getAuthResponse();
    console.log("[DEBUG] facebook =", session); // eslint-disable-line
    const currentTime = (new Date()).getTime() / 1000;
    return session && session.access_token && session.expires > currentTime;
  },

});

export default socialAuth;
