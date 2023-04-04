import { useCallback } from 'react';
import { openSignUpInModal, ISignUpInMetaData } from 'events/openSignUpInModal';

export default function useOpenAuthModal() {
  const openAuthModal = useCallback((metaData?: Partial<ISignUpInMetaData>) => {
    return openSignUpInModal(metaData);
  }, []);

  return openAuthModal;
}
