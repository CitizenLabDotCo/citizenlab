import { useState, useEffect } from 'react';
import { IUserData } from 'services/users';
import { folderModeratorsStream } from 'modules/project_folders/services/projectFolderModerators';

export default function useProjectFolderModerators(projectFolderId: string) {
  const [folderModerators, setFolderModerators] = useState<
    IUserData[] | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = folderModeratorsStream(
      projectFolderId
    ).observable.subscribe((response) => {
      setFolderModerators(response.data);
    });

    return () => subscription.unsubscribe();
  }, [projectFolderId]);

  return folderModerators;
}
