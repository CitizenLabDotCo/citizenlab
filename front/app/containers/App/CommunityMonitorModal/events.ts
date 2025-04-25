import eventEmitter from 'utils/eventEmitter';

const TRIGGER_COMMUNITY_MONITOR_MODAL = 'triggerCommunityMonitorModal';

export function triggerCommunityMonitorModal({
  preview,
}: {
  preview: boolean;
}) {
  eventEmitter.emit(TRIGGER_COMMUNITY_MONITOR_MODAL, { preview });
}

export const triggerCommunityMonitorModal$ = eventEmitter.observeEvent<Event>(
  TRIGGER_COMMUNITY_MONITOR_MODAL
);
