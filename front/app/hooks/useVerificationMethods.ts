import { useEffect, useState } from 'react';
import {
  TVerificationMethod,
  verificationMethodsStream,
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
