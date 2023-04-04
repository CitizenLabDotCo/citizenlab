import { useCallback } from 'react';
import { openSignUpInModal, ISignUpInMetaData } from 'events/openSignUpInModal';

export default function useOpenAuthModal() {
  const openAuthModal = useCallback((metaData?: ISignUpInMetaData) => {
    return openSignUpInModal(metaData);
  }, []);

  return openAuthModal;
}
