import { useState, useEffect, useRef } from 'react';
import {
  referenceDistributionStream,
  IReferenceDistribution,
} from '../services/referenceDistribution';
import { isNilOrError, NilOrError, isNil, isError } from 'utils/helperUtils';
import { isEqual } from 'lodash-es';
import { combineLatest, map } from 'rxjs';

/*
 * This function is really complicated right now. It has to check if any
 * reference distribution data has been uploaded, and does that by making
 * a request for to reach reference distribution endpoint.
 * Clearly this is super inefficient, and ideally this should be done
 * on the backend using a dedicated endpoint.
 */
function useAnyReferenceDataUploaded(
  fieldIds?: string[]
): boolean | NilOrError {
  const [anyReferenceDataUploaded, setAnyReferenceDataUploaded] = useState<
    boolean | NilOrError
  >();
  const fieldIdsRef = useRef<string[] | undefined>();

  useEffect(() => {
    if (!fieldIds) {
      setAnyReferenceDataUploaded(null);
      return;
    }

    if (isEqual(fieldIds, fieldIdsRef.current)) return;
    fieldIdsRef.current = fieldIds;

    // What this is doing is making a request to all the
    // reference distribution endpoints associated with the
    // fieldIds, and then when all are done combining it
    // into a new observable
    const observable = combineLatest(
      fieldIds.map((id) =>
        referenceDistributionStream(id).observable.pipe(
          map((referenceDistribution: IReferenceDistribution | NilOrError) =>
            !isNilOrError(referenceDistribution)
              ? referenceDistribution.data
              : referenceDistribution
          )
        )
      )
    );

    // Next, we subscribe to this observable and check
    // if any reference distributions have been uploaded.
    // If any of the requests returns an error, we set the value
    // to an error.
    const subscription = observable.subscribe((referenceDistributions) => {
      let anyReferenceDataUploaded = false;

      for (const referenceDistribution in referenceDistributions) {
        if (isError(referenceDistribution)) {
          setAnyReferenceDataUploaded(referenceDistribution);
          return;
        }

        if (!isNil(referenceDistribution)) {
          anyReferenceDataUploaded = true;
        }
      }

      setAnyReferenceDataUploaded(anyReferenceDataUploaded);
    });

    return () => subscription.unsubscribe();
  }, [fieldIds]);

  return anyReferenceDataUploaded;
}

export default useAnyReferenceDataUploaded;
