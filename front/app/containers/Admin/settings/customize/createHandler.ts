import { get } from 'lodash-es';
import { UploadFile, Multiloc } from 'typings';

type TUploadType = 'logo' | 'header_bg';

const setErrors = (state, type: TUploadType) => ({
  logoError: type === 'logo' ? null : state.logoError,
  headerError: type === 'header_bg' ? null : state.headerError,
});

export function createAddUploadHandler(type: TUploadType, setState) {
  return (newImage: UploadFile[]) => {
    setState((state) => ({
      ...state,
      ...setErrors(state, type),
      [type]: [newImage[0]],
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [type]: newImage[0].base64,
      },
    }));
  };
}

export function createRemoveUploadHandler(type: TUploadType, setState) {
  return () => {
    setState((state) => ({
      ...state,
      ...setErrors(state, type),
      [type]: null,
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [type]: null,
      },
    }));
  };
}

export function createCoreMultilocHandler(property: string, setState) {
  return (multiloc: Multiloc) => {
    setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...state.settings,
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.settings, 'core', {}),
              ...get(state.attributesDiff, 'settings.core', {}),
              [property]: multiloc,
            },
          },
        },
      };
    });
  };
}
