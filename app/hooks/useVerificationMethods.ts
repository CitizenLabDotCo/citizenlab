import { useState, useEffect } from 'react';
import {
  verificationMethodsStream,
  IVerificationMethods,
} from 'services/verificationMethods';

export default function useVerificationMethods() {
  const [verificationMethods, setVerificationMethods] = useState<
    IVerificationMethods | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = verificationMethodsStream().observable.subscribe(
      (response) => {
        setVerificationMethods(response);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return verificationMethods;
}
