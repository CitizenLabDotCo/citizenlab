import { useState, useEffect } from 'react';
import { ITag, tagStream } from 'services/tags';

export interface IUseTag {
  tag: ITag | null | Error | undefined;
}

export default function useTag(tagId: string) {
  const [tag, setTag] = useState<ITag | null | undefined>(undefined);

  useEffect(() => {
    const observable = tagStream(tagId).observable;

    const subscription = observable.subscribe((response) => {
      setTag(response ? response.data : response);
    });

    return () => subscription.unsubscribe();
  }, [tagId]);

  return { tag };
}
