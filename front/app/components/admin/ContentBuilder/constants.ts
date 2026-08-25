export const IMAGE_UPLOADING_EVENT = 'imageUploading';
export const IMAGE_LOADED_EVENT = 'imageLoaded';
export const IMAGES_LOADED_EVENT = 'imagesLoaded';

export const CONTENT_BUILDER_ERROR_EVENT = 'contentBuilderError';
export const CONTENT_BUILDER_DELETE_ELEMENT_EVENT =
  'deleteContentBuilderElement';

// The custom page builder's route segment. A builder route has to be recognised in several
// unrelated places — the admin sidebar suppression, widget editability, the preview iframe —
// and a typo in any of them fails silently, so they all read it from here.
export const CUSTOM_PAGE_BUILDER_PATH = 'admin/custom-page-builder';

export const DEFAULT_PADDING = '20px';

export const TOOLBOX_WIDTH = '236px';
export const SETTINGS_PANEL_WIDTH = '400px';
