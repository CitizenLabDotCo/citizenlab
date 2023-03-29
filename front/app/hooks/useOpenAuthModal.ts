import { useCallback, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';
import { openSignUpInModal, ISignUpInMetaData } from 'events/openSignUpInModal';

interface Params {
  onSuccess?: () => void;
  waitIf?: boolean;
}

type OpenAuthModalParams = Partial<Omit<ISignUpInMetaData, 'onSuccess'>>;

const flowCompletedStream = new BehaviorSubject(false);

export default function useOpenAuthModal({ onSuccess, waitIf }: Params = {}) {
  const openAuthModal = useCallback((metaData?: OpenAuthModalParams) => {
    return openSignUpInModal({
      ...metaData,
      onSuccess: () => {
        flowCompletedStream.next(true);
      },
    });
  }, []);

  useEffect(() => {
    if (waitIf) return;

    const subscription = flowCompletedStream.subscribe((flowCompleted) => {
      // console.log({ flowCompleted })
      if (flowCompleted) {
        // console.log('calling onSuccess')
        onSuccess?.();
        flowCompletedStream.next(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [waitIf, onSuccess]);

  return openAuthModal;
}
