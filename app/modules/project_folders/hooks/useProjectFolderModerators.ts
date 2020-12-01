import { useState, useEffect, useCallback } from 'react';
import { moderatorsStream } from 'modules/project_folders/services/moderators';
import { IUsers, IUserData } from 'services/users';
import { isNilOrError } from 'utils/helperUtils';
import {
  addModerator,
  deleteModerator,
} from 'modules/project_folders/services/moderators';

export default function useProjectFolderImages(
  projectFolderId?: string | undefined
) {
  const [moderators, setModerators] = useState<
    IUsers | undefined | null | Error
  >(undefined);

  const isModerator = useCallback(
    (user: IUserData) => {
      return !isNilOrError(moderators) && moderators.data.includes(user);
    },
    [moderators]
  );

  useEffect(() => {
    const subscription = moderatorsStream(projectFolderId).observable.subscribe(
      (stream_moderators) => {
        setModerators(stream_moderators);
      }
    );

    return () => subscription?.unsubscribe();
  }, [projectFolderId]);

  return { moderators, isModerator, addModerator, deleteModerator };
}
