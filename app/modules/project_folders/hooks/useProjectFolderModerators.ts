import { useState, useEffect, useCallback } from 'react';
import { IUsers, IUserData } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';
import {
  moderatorsStream,
  addModerator,
  deleteModerator,
} from 'modules/project_folders/services/moderators';

export default function useProjectFolderModerators(projectFolderId: string) {
  const [moderators, setModerators] = useState<
    IUsers | undefined | null | Error
  >(undefined);

  const isModerator = useCallback(
    (user: IUserData) => {
      if (isNilOrError(moderators)) {
        return false;
      }

      return moderators.data.some((mod) => mod.id === user.id);
    },
    [moderators]
  );

  const isNotModerator = useCallback(
    (user: IUserData) => {
      if (isNilOrError(moderators)) {
        return true;
      }

      return !moderators.data.some((mod) => mod.id === user.id);
    },
    [moderators]
  );

  useEffect(() => {
    const subscription = moderatorsStream(projectFolderId).observable.subscribe(
      (streamModerators) => {
        setModerators(streamModerators);
      }
    );

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return {
    moderators,
    isModerator,
    addModerator,
    deleteModerator,
    isNotModerator,
  };
}
