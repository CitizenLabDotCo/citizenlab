import useAuthUser from 'api/me/useAuthUser';

import { isAdmin } from 'utils/permissions/roles';

interface Params {
  spaceId?: string | null;
  folderId?: string | null;
  projectInRoot: boolean;
}

/*
  Leaving both selects empty is a valid choice: the project then simply is not
  in a space or a folder. Managers are the exception for a project that is in
  one, because that space or folder is what gives them access to the project in
  the first place — emptying both would lock them out of it.
*/
export const useValidateProjectContext = () => {
  const { data: authUser } = useAuthUser();

  return ({ spaceId, folderId, projectInRoot }: Params): boolean => {
    if (isAdmin(authUser) || projectInRoot) return true;

    return !!spaceId || !!folderId;
  };
};
