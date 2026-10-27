// Storybook's mock worker: msw's own (mockServiceWorker.js, written by
// `npm install`), with two rules added.
//
// The rule msw 2.5 added. Before 2.5, a request from a frame is answered by
// the first frame on the page that started mocking, so in the workbench
// gallery a story in a frame of its own got the shared frame's mock data.
// Here a frame that started mocking answers its own requests. Drop this
// rule once the platform's msw is 2.5 or later.
//
// Files never reach the mocks. In msw's worker every request of a page that
// mocks costs a round trip to that page and a fetch from the worker, and a
// preview frame loads 90 to 300 modules; the workbench, in the worker's
// scope too, loads its own files. Scripts, styles and fonts, and any file
// of this origin, skip msw's listener (registered after this one) and load
// as they would without a worker. API requests have no file extension and
// still reach the mocks.
const FILE_DESTINATIONS = ['script', 'style', 'font', 'manifest', 'worker'];
const FILE_PATH =
  /\.(?:[cm]?[jt]sx?|css|json|map|woff2?|ttf|otf|eot|png|jpe?g|gif|svg|webp|avif|ico|wasm)$/i;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (
    FILE_DESTINATIONS.includes(request.destination) ||
    (url.origin === self.location.origin && FILE_PATH.test(url.pathname))
  ) {
    event.stopImmediatePropagation();
  }
});

importScripts('./mockServiceWorker.js');

if (
  typeof resolveMainClient === 'function' &&
  typeof activeClientIds !== 'undefined'
) {
  const firstMockingFrame = resolveMainClient;
  resolveMainClient = async (event) =>
    activeClientIds.has(event.clientId)
      ? self.clients.get(event.clientId)
      : firstMockingFrame(event);
}
