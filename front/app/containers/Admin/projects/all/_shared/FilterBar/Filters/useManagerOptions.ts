import useUsers from 'api/users/useUsers';

import { getFullName } from 'utils/textUtils';

// Everyone who can manage something, by name.
// TODO (TAN-8876): only the first 500 are loaded. A manager picked beyond
// them (from a shared link, on a large platform) shows without a name and
// can't be unticked; fetch the picked ones by id, or search on the server.
const useManagerOptions = ({ enabled = true } = {}) => {
  const { data: managers, isLoading } = useUsers(
    { pageSize: 500, can_moderate: true },
    { enabled }
  );

  const options =
    managers?.data.map((manager) => ({
      value: manager.id,
      label: getFullName(manager),
    })) ?? [];

  options.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  );

  return { options, isLoading };
};

export default useManagerOptions;
