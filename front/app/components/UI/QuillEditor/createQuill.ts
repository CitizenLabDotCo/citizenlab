import Quill, { Range } from 'quill';

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
  altTextLabel?: string;
  imageTitleLabel?: string;
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
    altTextLabel,
    imageTitleLabel,
  }: Params
) => {
  const quill = new Quill(editorContainer, {
    theme: 'snow',
    formats: [
      'bold',
      'italic',
      ...(!noLinks ? ['link'] : []),
      ...(withCTAButton ? ['button'] : []),
      ...(!limitedTextFormatting ? ['header', 'list'] : []),
      ...(!limitedTextFormatting && !noAlign ? ['align'] : []),
      ...(!noImages ? ['image'] : []),
      ...(!noVideos ? ['video'] : []),
    ],
    modules: {
      blotFormatter:
        !noImages || !noVideos
          ? {
              image: {
                altTitleModalOptions: {
                  labels: {
                    alt: altTextLabel || 'Alt Text',
                    title: imageTitleLabel || 'Image Title',
                  },
                },
              },
            }
          : false,
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

  // Quill 2.0 bug: the default image handler calls getSelection(true) after
  // the file picker closes, but focus is already lost so it returns null.
  // Track selection ourselves and use a custom handler.
  if (!noImages) {
    let lastKnownRange: Range | null = null;
    quill.on('selection-change', (range: Range | null) => {
      if (range) lastKnownRange = range;
    });

    const toolbar = quill.getModule('toolbar') as any;
    toolbar.addHandler('image', () => {
      if (!document.body.contains(quill.root)) return;

      const range = lastKnownRange || {
        index: quill.getLength() - 1,
        length: 0,
      };

      let fileInput = quill.container.querySelector(
        'input.ql-image[type=file]'
      ) as HTMLInputElement | null;

      if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('accept', 'image/png, image/jpeg');
        fileInput.classList.add('ql-image');
        fileInput.style.display = 'none';
        quill.container.appendChild(fileInput);
      }

      fileInput.onchange = () => {
        if (fileInput && fileInput.files?.length) {
          (quill as any).uploader.upload(range, fileInput.files);
        }
        if (fileInput) fileInput.value = '';
      };

      fileInput.click();
    });
  }

  // Apply correct attributes for a11y
  const editor = editorContainer.getElementsByClassName('ql-editor')[0];

  editor.setAttribute('name', id);
  editor.setAttribute('id', id);
  editor.setAttribute('aria-labelledby', id);
  editor.setAttribute('aria-multiline', 'true');
  editor.setAttribute('role', 'textbox');

  return quill;
};
