import eventEmitter from 'utils/eventEmitter';

const TRIGGER_COMMUNITY_MONITOR_MODAL = 'triggerCommunityMonitorModal';

export function triggerCommunityMonitorModal() {
  eventEmitter.emit(TRIGGER_COMMUNITY_MONITOR_MODAL);
}

export const triggerCommunityMonitorModal$ = eventEmitter.observeEvent<Event>(
  TRIGGER_COMMUNITY_MONITOR_MODAL
);
