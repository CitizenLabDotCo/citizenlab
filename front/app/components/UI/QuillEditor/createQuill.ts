import Quill, { Range } from 'quill';

import type Toolbar from 'quill/modules/toolbar';

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
      ...(!noImages ? ['image', 'imageAlign'] : []),
      ...(!noVideos ? ['video', 'iframeAlign'] : []),
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

    const toolbar = quill.getModule('toolbar') as Toolbar;
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
        const files = fileInput?.files;
        if (files && files.length) {
          quill.uploader.upload(range, files);
        }
        if (fileInput) fileInput.value = '';
      };

      fileInput.click();
    });
  }

  // Quill resolves the cursor at the end of an inline blot to the position
  // OUTSIDE the blot, so typing at the end of a button inserts text after it.
  // Intercept the input ONLY when the cursor is at the exact end of a button
  // blot. Pressing ArrowRight moves the cursor past that point, so subsequent
  // typing naturally goes outside the button.
  if (withCTAButton) {
    quill.root.addEventListener('beforeinput', (event: InputEvent) => {
      if (event.inputType !== 'insertText' || !event.data) return;

      const range = quill.getSelection();
      if (!range || range.length !== 0 || range.index === 0) return;

      // Find the leaf at the previous index and walk up to a button blot.
      const [leaf] = quill.getLeaf(range.index - 1);
      if (!leaf) return;

      let blot = leaf.parent;
      while (blot !== quill.scroll) {
        if (blot.statics.blotName === 'button') break;
        blot = blot.parent;
      }
      if (blot === quill.scroll) return;

      // Only intercept when the cursor is at the exact end of this button.
      const buttonEnd = blot.offset(quill.scroll) + blot.length();
      if (range.index !== buttonEnd) return;

      const buttonUrl = blot.domNode.getAttribute('href');
      event.preventDefault();
      quill.insertText(range.index, event.data, 'button', buttonUrl, 'user');
      quill.setSelection(range.index + event.data.length, 0, 'silent');
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
