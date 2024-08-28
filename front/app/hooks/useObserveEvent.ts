import { useEffect } from 'react';

import eventEmitter, { IEventEmitterEvent } from 'utils/eventEmitter';

// Hook
export default (
  eventName: string | undefined,
  callBack: (event: IEventEmitterEvent<unknown>) => void
) => {
  useEffect(() => {
    if (eventName) {
      const subscription = eventEmitter
        .observeEvent(eventName)
        .subscribe((event) => {
          callBack(event);
        });

      return () => subscription.unsubscribe();
    }
    return () => {};
  }, [eventName, callBack]);

  return null;
};
