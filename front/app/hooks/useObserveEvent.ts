import { useEffect } from 'react';
import eventEmitter from 'utils/eventEmitter';

// Hook
export default (eventName: string | undefined, callBack: () => void) => {
  useEffect(() => {
    if (eventName) {
      const subscription = eventEmitter
        .observeEvent(eventName)
        .subscribe(() => {
          callBack();
        });

      return () => subscription.unsubscribe();
    }
    return () => {};
  }, [eventName, callBack]);

  return null;
};
