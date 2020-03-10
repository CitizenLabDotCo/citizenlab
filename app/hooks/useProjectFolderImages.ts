import { useState, useEffect } from 'react';
import { projectFolderImagesStream, IProjectFolderImages } from 'services/projectFolderImages';

export default function useProjectFolderImages(projectFolderId: string) {
  const [projectFolderImage, setIdeaCustomFields] = useState<IProjectFolderImages | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = projectFolderImagesStream(projectFolderId).observable.subscribe((projectFolderImage) => {
      setIdeaCustomFields(projectFolderImage);
    });

    return () => subscription.unsubscribe();
  }, [projectFolderId]);

  return projectFolderImage;
}
