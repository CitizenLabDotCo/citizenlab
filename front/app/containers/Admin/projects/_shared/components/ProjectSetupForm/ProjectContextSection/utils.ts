import useAuthUser from 'api/me/useAuthUser';

import { isAdmin } from 'utils/permissions/roles';

import { FormSituation } from './types';

interface Params {
  folder_id?: string | null;
  space_id?: string | null;
}

/*
  Leaving both selects empty is a valid choice: the project then simply is not
  in a space or a folder. Managers are the exception when they edit a project
  that is in a space or a folder, because that space or folder is what gives
  them access to the project in the first place — emptying both would lock them
  out of it. When creating, they are allowed to do it: the project then needs
  approval from an admin before it can be published.
*/
export const useValidateProjectContext = () => {
  const { data: authUser } = useAuthUser();

  return (
    { folder_id, space_id }: Params,
    formSituation: FormSituation
  ): boolean => {
    if (isAdmin(authUser)) return true;
    if (formSituation !== 'editing-project-not-in-root') return true;

    return !!space_id || !!folder_id;
  };
};
