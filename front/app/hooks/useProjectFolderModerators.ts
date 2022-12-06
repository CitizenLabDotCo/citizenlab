import { useState, useEffect } from 'react';
import { folderModeratorsStream } from 'services/projectFolderModerators';
import { IUserData } from 'services/users';

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
