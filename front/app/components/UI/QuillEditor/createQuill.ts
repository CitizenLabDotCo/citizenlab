import Quill from 'quill';

import { attributes } from './altTextToImagesModule';

interface Params {
  toolbarId?: string;
  noImages?: boolean;
  noVideos?: boolean;
  noAlign?: boolean;
  limitedTextFormatting?: boolean;
  withCTAButton?: boolean;
  onBlur?: () => void;
}

export const createQuill = (
  editorContainer: HTMLDivElement,
  {
    toolbarId,
    limitedTextFormatting,
    noAlign,
    noImages,
    noVideos,
    withCTAButton,
    onBlur,
  }: Params
) => {
  const quill = new Quill(editorContainer, {
    theme: 'snow',
    formats: [
      'bold',
      'italic',
      'link',
      ...attributes,
      ...(withCTAButton ? ['button'] : []),
      ...(!limitedTextFormatting ? ['header', 'list'] : []),
      ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
      ...(!noImages ? ['image'] : []),
      ...(!noVideos ? ['video'] : []),
    ],
    modules: {
      altTextToImages: true,
      blotFormatter: !noImages || !noVideos,
      toolbar: toolbarId ? `#${toolbarId}` : false,
      keyboard: {
        bindings: {
          // overwrite default tab behavior
          tab: {
            key: 9,
            handler: () => {
              onBlur && onBlur();
              return true;
            }, // do nothing
          },
          'remove tab': {
            key: 9,
            shiftKey: true,
            collapsed: true,
            prefix: /\t$/,
            handler: () => true, // do nothing
          },
        },
      },
      clipboard: {
        matchVisual: false,
      },
    },
  });

  return quill;
};
