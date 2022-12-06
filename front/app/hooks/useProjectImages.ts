import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  IProjectImages,
  IProjectImageData,
  projectImagesStream,
} from 'services/projectImages';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectId: string | null;
}

export default function useProjectImages({ projectId }: Props) {
  const [projectImages, setProjectImages] = useState<
    IProjectImageData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setProjectImages(undefined);

    let observable: Observable<IProjectImages | null> = of(null);

    if (projectId) {
      observable = projectImagesStream(projectId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const project = !isNilOrError(response) ? response.data : response;
      setProjectImages(project);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectImages;
}
