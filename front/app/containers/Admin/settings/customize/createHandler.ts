import { get } from 'lodash-es';
import { Multiloc } from 'typings';

export function createCoreMultilocHandler(property: string, setState) {
  return (multiloc: Multiloc) => {
    setState((attributesDiff) => {
      return {
        ...attributesDiff,
        settings: {
          ...attributesDiff.settings,
          ...get(attributesDiff, 'settings', {}),
          core: {
            ...get(attributesDiff.settings, 'core', {}),
            ...get(attributesDiff, 'settings.core', {}),
            [property]: multiloc,
          },
        },
      };
    });
  };
}
