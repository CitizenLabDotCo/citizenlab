import { useCallback } from 'react';
import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';
import { AuthenticationData } from 'containers/NewAuthModal/typings';

export default function useOpenAuthModal() {
  const openAuthModal = useCallback(
    (metaData?: Partial<AuthenticationData>) => {
      return triggerAuthenticationFlow(metaData);
    },
    []
  );

  return openAuthModal;
}
