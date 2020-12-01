import { useState, useEffect } from 'react';
import { moderatorsStream } from 'modules/project_folders/services/moderators';
import { IUsers } from 'services/users';

export default function useProjectFolderImages(
  projectFolderId?: string | undefined
) {
  const [moderators, setModerators] = useState<
    IUsers | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = projectFolderId
      ? moderatorsStream(projectFolderId).observable.subscribe(
          (stream_moderators) => {
            setModerators(stream_moderators);
          }
        )
      : null;

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return moderators;
}
