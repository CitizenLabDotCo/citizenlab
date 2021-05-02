import eventEmitter from 'utils/eventEmitter';

enum events {
  selectedIdeaIdChanged = 'selectedIdeaIdChanged',
}

// ---------

export function setSelectedIdeaId(ideaId: string) {
  eventEmitter.emit<string>(events.selectedIdeaIdChanged, ideaId);
}

export const selectedIdeaId$ = eventEmitter.observeEvent<string>(
  events.selectedIdeaIdChanged
);

// ---------
