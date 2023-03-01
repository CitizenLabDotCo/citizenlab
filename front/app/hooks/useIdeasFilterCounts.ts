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
  props: IIdeasFilterCountsQueryParameters
) {
  const [ideasFilterCounts, setIdeasFilterCounts] = useState<
    IIdeasFilterCounts | NilOrError
  >();

  const propsStr = JSON.stringify(omitBy(props, isNil));

  useEffect(() => {
    const streamParams = {
      queryParameters: JSON.parse(
        propsStr
      ) as IIdeasFilterCountsQueryParameters,
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
