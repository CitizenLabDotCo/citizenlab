import { useState, useEffect } from 'react';
import {
  verificationMethodsStream,
  TVerificationMethod,
} from 'services/verificationMethods';

export default function useVerificationMethods() {
  const [verificationMethods, setVerificationMethods] = useState<
    TVerificationMethod[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = verificationMethodsStream().observable.subscribe(
      (response) => {
        setVerificationMethods(response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return verificationMethods;
}
