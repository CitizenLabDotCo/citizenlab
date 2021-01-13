import { useState, useEffect, useCallback } from 'react';
import { IUsers, IUserData } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';
import {
  folderModeratorsStream,
  addFolderModerator,
  deleteFolderModerator,
} from 'modules/project_folders/services/moderators';

export default function useProjectFolderModerators(projectFolderId: string) {
  const [folderModerators, setFolderModerators] = useState<
    IUsers | undefined | null | Error
  >(undefined);

  const isFolderModerator = useCallback(
    (user: IUserData) => {
      if (isNilOrError(folderModerators)) {
        return false;
      }

      return folderModerators.data.some((mod) => mod.id === user.id);
    },
    [folderModerators]
  );

  const isNotFolderModerator = useCallback(
    (user: IUserData) => {
      if (isNilOrError(folderModerators)) {
        return true;
      }

      return !folderModerators.data.some((mod) => mod.id === user.id);
    },
    [folderModerators]
  );

  useEffect(() => {
    const subscription = folderModeratorsStream(
      projectFolderId
    ).observable.subscribe((streamModerators) => {
      setFolderModerators(streamModerators);
    });

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return {
    folderModerators,
    isFolderModerator,
    addFolderModerator,
    deleteFolderModerator,
    isNotFolderModerator,
  };
}
