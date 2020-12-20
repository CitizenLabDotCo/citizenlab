import { useState, useEffect } from 'react';
import { IProjectImageData, projectImagesStream } from 'services/projectImages';

export default function useProjectImages(projectId: string) {
  const [projectImages, setProjectImages] = useState<
    IProjectImageData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = projectImagesStream(projectId).observable.subscribe(
      (projectImages) => {
        setProjectImages(projectImages?.data);
      }
    );

    return () => subscription?.unsubscribe();
  }, [projectId]);

  return projectImages;
}
