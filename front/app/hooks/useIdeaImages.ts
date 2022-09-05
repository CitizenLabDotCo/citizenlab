import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  IIdeaImages,
  IIdeaImageData,
  ideaImagesStream,
} from 'services/ideaImages';

export default function useIdeaImages(ideaId: string | undefined) {
  const [ideaImages, setIdeaImages] = useState<
    IIdeaImageData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setIdeaImages(undefined);

    let observable: Observable<IIdeaImages | null> = of(null);

    if (ideaId) {
      observable = ideaImagesStream(ideaId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const idea = !isNilOrError(response) ? response.data : response;
      setIdeaImages(idea);
    });

    return () => subscription.unsubscribe();
  }, [ideaId]);

  return ideaImages;
}
