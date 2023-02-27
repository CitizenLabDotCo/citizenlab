import { useState, useEffect } from 'react';

// services
import {
  IIdeasFilterCounts,
  ideasFilterCountsStream,
  IIdeasFilterCountsQueryParameters,
} from 'services/ideas';

// utils
import { omitBy, isNil } from 'lodash-es';

// typings
import { NilOrError } from 'utils/helperUtils';

export default function useIdeasFilterCounts(
  props: IIdeasFilterCountsQueryParameters | null
) {
  const [ideasFilterCounts, setIdeasFilterCounts] = useState<
    IIdeasFilterCounts | NilOrError
  >();

  const propsStr = props === null ? null : JSON.stringify(omitBy(props, isNil));

  useEffect(() => {
    const streamParams =
      propsStr === null
        ? null
        : {
            queryParameters: JSON.parse(propsStr),
          };

    const { observable } = ideasFilterCountsStream(streamParams);
    const subscription = observable.subscribe(
      (ideasFilterCounts: IIdeasFilterCounts | NilOrError) => {
        setIdeasFilterCounts(ideasFilterCounts);
      }
    );

    return () => subscription.unsubscribe();
  }, [propsStr]);

  return ideasFilterCounts;
}
