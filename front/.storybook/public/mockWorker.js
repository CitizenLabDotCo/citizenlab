// Storybook's mock worker: msw's own (mockServiceWorker.js, written by
// `npm install`), with the rule msw 2.5 added. Before 2.5, a request from a
// frame is answered by the first frame on the page that started mocking, so
// in the workbench gallery a story in a frame of its own got the shared
// frame's mock data. Here a frame that started mocking answers its own
// requests. Delete this file, and point preview.tsx back at
// mockServiceWorker.js, once the platform's msw is 2.5 or later.
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
