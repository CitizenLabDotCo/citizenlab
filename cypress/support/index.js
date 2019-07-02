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

Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});
