import { useState, useCallback, useEffect } from 'react';
import { openSignUpInModal, ISignUpInMetaData } from 'events/openSignUpInModal';

interface Params {
  onSuccess?: () => void;
  waitIf?: boolean;
}

type OpenAuthModalParams = Partial<Omit<ISignUpInMetaData, 'onSuccess'>>;

export default function useOpenAuthModal({ onSuccess, waitIf }: Params = {}) {
  const [executeSuccess, setExecuteSuccess] = useState(false);

  const openAuthModal = useCallback((metaData?: OpenAuthModalParams) => {
    setExecuteSuccess(false);

    return openSignUpInModal({
      ...metaData,
      onSuccess: () => {
        setExecuteSuccess(true);
      },
    });
  }, []);

  useEffect(() => {
    if (waitIf) return;
    if (!executeSuccess) return;

    onSuccess?.();
    setExecuteSuccess(false);
  }, [executeSuccess, waitIf, onSuccess]);

  return openAuthModal;
}
