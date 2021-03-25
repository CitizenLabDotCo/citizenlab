import { useState, useEffect } from 'react';
import {
  projectFolderImagesStream,
  IProjectFolderImages,
} from 'modules/project_folders/services/projectFolderImages';

export default function useProjectFolderImages(
  projectFolderId: string | undefined
) {
  const [projectFolderImage, setProjectFolderImages] = useState<
    IProjectFolderImages | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = projectFolderId
      ? projectFolderImagesStream(projectFolderId).observable.subscribe(
          (projectFolderImage) => {
            setProjectFolderImages(projectFolderImage);
          }
        )
      : null;

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return projectFolderImage;
}
