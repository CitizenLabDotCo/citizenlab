import { MAP_CONFIG_SAVER_KEY } from 'containers/Admin/CustomMapConfigPage';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// Saving from the map returns to the phase's build form, where any errors of
// the phase's panels show. Only when the map alone failed does it stay open,
// so its own error stays in view.
const returnToPhaseAfterSave = (failedKeys: string[]) => {
  if (!new URLSearchParams(window.location.search).has('map_config')) return;

  const onlyMapFailed =
    failedKeys.length > 0 &&
    failedKeys.every((key) => key === MAP_CONFIG_SAVER_KEY);

  if (!onlyMapFailed) removeSearchParams(['map_config']);
};

export default returnToPhaseAfterSave;
