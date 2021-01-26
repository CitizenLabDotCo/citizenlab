import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  IIdeaImage,
  IIdeaImageData,
  ideaImageStream,
} from 'services/ideaImages';

interface Props {
  ideaId: string | null | undefined;
  ideaImageId: string | null | undefined;
}

export default function useIdeaImage({ ideaId, ideaImageId }: Props) {
  const [ideaImage, setIdeaImage] = useState<
    IIdeaImageData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setIdeaImage(undefined);

    let observable: Observable<IIdeaImage | null> = of(null);

    if (ideaId && ideaImageId) {
      observable = ideaImageStream(ideaId, ideaImageId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const idea = !isNilOrError(response) ? response.data : response;
      setIdeaImage(idea);
    });

    return () => subscription.unsubscribe();
  }, [ideaId, ideaImageId]);

  return ideaImage;
}
