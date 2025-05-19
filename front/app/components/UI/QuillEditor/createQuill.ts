import Quill from 'quill';

import { attributes } from './altTextToImagesModule';

interface Params {
  id: string;
  toolbarId: string;
  noImages: boolean;
  noVideos: boolean;
  noAlign: boolean;
  limitedTextFormatting?: boolean;
  withCTAButton?: boolean;
  noLinks: boolean;
  onBlur?: () => void;
}

export const createQuill = (
  editorContainer: HTMLDivElement,
  {
    id,
    toolbarId,
    limitedTextFormatting,
    noAlign,
    noImages,
    noVideos,
    noLinks,
    withCTAButton,
    onBlur,
  }: Params
) => {
  const quill = new Quill(editorContainer, {
    theme: 'snow',
    formats: [
      'bold',
      'italic',
      ...(!noLinks ? ['link'] : []),
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
      toolbar: `#${toolbarId}`,
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

  // Apply correct attributes for a11y
  const editor = editorContainer.getElementsByClassName('ql-editor')[0];

  editor.setAttribute('name', id);
  editor.setAttribute('id', id);
  editor.setAttribute('aria-labelledby', id);
  editor.setAttribute('aria-multiline', 'true');
  editor.setAttribute('role', 'textbox');

  return quill;
};
