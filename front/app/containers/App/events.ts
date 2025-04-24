import { triggerCommunityMonitorModal } from './CommunityMonitorModal/events';

type TriggerPostActionEventsParams = {
  preview?: boolean;
};

/*
// triggerPostActionEvents:
//
// Description: This function is used to trigger any post-action events.
// Example: When a user attends an event, this function can be called to trigger the community monitor modal.
//
// Note: Can be extended to include more configuration in the future as needed.
*/
export function triggerPostActionEvents({
  preview = false,
}: TriggerPostActionEventsParams) {
  setTimeout(() => triggerCommunityMonitorModal({ preview }), 2000);
}
