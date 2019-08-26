import './commands'

// before(function () {
//   // run this once before all code
//   return window.caches.keys().then((cacheNames) => {
//     return Promise.all(
//       cacheNames.map((cacheName) => {
//         return window.caches.delete(cacheName);
//       })
//     );
//   });
// });

// beforeEach(() => {
//   // remove service workers before each test
//   cy.unregisterServiceWorkers();
// });

// // Fail-fast-all-files
// before(function () {
//   cy.getCookie('has-failed-test').then(cookie => {
//     if (cookie && typeof cookie === 'object' && cookie.value === 'true') {
//       Cypress.runner.stop();
//     }
//   });
// });

// // Fail-fast-single-file
// afterEach(function () {
//   if (this.currentTest.state === 'failed') {
//     cy.setCookie('has-failed-test', 'true');
//     Cypress.runner.stop();
//   }
// });

// Cypress.on('uncaught:exception', (err, runnable) => {
//   // returning false here prevents Cypress from
//   // failing the test
//   return false;
// });

// Cypress.on('fail', (err, runnable) => {
//   debugger;
//   throw err;
// });
