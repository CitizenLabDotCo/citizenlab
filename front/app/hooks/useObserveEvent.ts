import { useEffect } from 'react';
import eventEmitter from 'utils/eventEmitter';

// Hook
export default (eventName: string, callBack: () => void) => {
  useEffect(() => {
    const subscription = eventEmitter.observeEvent(eventName).subscribe(() => {
      callBack();
    });

    return () => subscription.unsubscribe();
  }, [eventName]);

  return null;
};
