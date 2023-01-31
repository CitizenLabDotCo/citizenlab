import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import {
  IProjectImages,
  IProjectImageData,
  projectImagesStream,
} from 'services/projectImages';

interface Props {
  projectId: string | null;
}

export default function useProjectCardImages({ projectId }: Props) {
  const [projectCardImages, setProjectCardImages] = useState<
    IProjectImageData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setProjectCardImages(undefined);

    let observable: Observable<IProjectImages | null> = of(null);

    if (projectId) {
      observable = projectImagesStream(projectId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const project = !isNilOrError(response) ? response.data : response;
      setProjectCardImages(project);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectCardImages;
}
