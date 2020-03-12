import { useState, useEffect } from 'react';
import { projectFolderImagesStream, IProjectFolderImages } from 'services/projectFolderImages';

export default function useProjectFolderImages(projectFolderId: string | undefined) {
  const [projectFolderImage, setIdeaCustomFields] = useState<IProjectFolderImages | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = projectFolderId ? projectFolderImagesStream(projectFolderId).observable.subscribe((projectFolderImage) => {
      setIdeaCustomFields(projectFolderImage);
    }) : null;

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return projectFolderImage;
}
