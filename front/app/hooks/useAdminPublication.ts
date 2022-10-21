import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import {
  adminPublicationByIdStream,
  IAdminPublicationData,
} from 'services/adminPublications';
import { isNilOrError } from 'utils/helperUtils';

export default function useAdminPublication(adminPublicationId: string | null) {
  const [adminPublication, setAdminPublication] = useState<
    IAdminPublicationData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setAdminPublication(undefined);

    let observable: Observable<{ data: IAdminPublicationData } | null> =
      of(null);

    if (adminPublicationId) {
      observable = adminPublicationByIdStream(adminPublicationId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const adminPublication = !isNilOrError(response)
        ? response.data
        : response;
      setAdminPublication(adminPublication);
    });

    return () => subscription.unsubscribe();
  }, [adminPublicationId]);

  return adminPublication;
}
