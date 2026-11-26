import useAuthUser from 'api/me/useAuthUser';
import useUpdateUser from 'api/users/useUpdateUser';

export const BACK_OFFICE_FEATURE = 'project_backoffice_redesign';

// Turns the new project back office on or off for the user, then reloads into
// the chosen version: the same page, or `path` when given.
const useSwitchBackOffice = () => {
  const { data: authUser } = useAuthUser();
  const { mutate, isPending, isError } = useUpdateUser();

  const switchBackOffice = (turnOn: boolean, path?: string) => {
    if (!authUser) return;

    const others = (authUser.data.attributes.early_access_opt_ins ?? []).filter(
      (feature) => feature !== BACK_OFFICE_FEATURE
    );

    mutate(
      {
        userId: authUser.data.id,
        early_access_opt_ins: turnOn
          ? [...others, BACK_OFFICE_FEATURE]
          : others,
      },
      {
        onSuccess: () => {
          if (path) {
            window.location.assign(path);
          } else {
            window.location.reload();
          }
        },
      }
    );
  };

  return { switchBackOffice, isPending, isError };
};

export default useSwitchBackOffice;
