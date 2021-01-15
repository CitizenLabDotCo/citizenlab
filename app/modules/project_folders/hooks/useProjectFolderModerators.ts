import { useState, useEffect, useCallback } from 'react';
import { IUserData } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';
import {
  folderModeratorsStream,
  addFolderModerator,
  deleteFolderModerator,
} from 'modules/project_folders/services/moderators';

export default function useProjectFolderModerators(projectFolderId: string) {
  const [folderModerators, setFolderModerators] = useState<
    IUserData[] | undefined | null | Error
  >(undefined);

  const isFolderModerator = useCallback(
    (user: IUserData) => {
      if (isNilOrError(folderModerators)) {
        return false;
      }

      return folderModerators.some((mod) => mod.id === user.id);
    },
    [folderModerators]
  );

  const isNotFolderModerator = useCallback(
    (user: IUserData) => {
      if (isNilOrError(folderModerators)) {
        return true;
      }

      return !folderModerators.some((mod) => mod.id === user.id);
    },
    [folderModerators]
  );

  useEffect(() => {
    const subscription = folderModeratorsStream(
      projectFolderId
    ).observable.subscribe((response) => {
      setFolderModerators(response.data);
    });

    return () => subscription.unsubscribe();
  }, [projectFolderId]);

  return {
    folderModerators,
    isFolderModerator,
    isNotFolderModerator,
  };
}
