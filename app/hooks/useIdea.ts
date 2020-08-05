import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  ideaByIdStream,
  ideaBySlugStream,
  IIdea,
  IIdeaData,
} from 'services/ideas';

interface Props {
  ideaId?: string | null;
  ideaSlug?: string | null;
}

export default function useIdea({ ideaId, ideaSlug }: Props) {
  const [idea, setIdea] = useState<IIdeaData | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setIdea(undefined);

    let observable: Observable<IIdea | null> = of(null);

    if (ideaId) {
      observable = ideaByIdStream(ideaId).observable;
    } else if (ideaSlug) {
      observable = ideaBySlugStream(ideaSlug).observable;
    }

    const subscription = observable.subscribe((response) => {
      const idea = !isNilOrError(response) ? response.data : response;
      setIdea(idea);
    });

    return () => subscription.unsubscribe();
  }, [ideaId, ideaSlug]);

  return idea;
}
