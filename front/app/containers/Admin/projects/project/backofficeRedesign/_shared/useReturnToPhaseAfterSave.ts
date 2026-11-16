import { MAP_CONFIG_SAVER_KEY } from 'components/admin/PageSaveContext/constants';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useSearch } from 'utils/router';

// Saving from the map returns to the phase's build form, where any errors of
// the phase's panels show. Only when the map alone failed does it stay open,
// so its own error stays in view.
const useReturnToPhaseAfterSave = () => {
  const { map_config } = useSearch({ strict: false });

  return (failedKeys: string[]) => {
    if (!map_config) return;

    const onlyMapFailed =
      failedKeys.length > 0 &&
      failedKeys.every((key) => key === MAP_CONFIG_SAVER_KEY);

    if (!onlyMapFailed) removeSearchParams(['map_config']);
  };
};

export default useReturnToPhaseAfterSave;
