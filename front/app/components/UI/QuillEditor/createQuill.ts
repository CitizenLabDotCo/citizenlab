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
  withGifSupport?: boolean;
  onBlur?: () => void;
  altTextLabel?: string;
  imageTitleLabel?: string;
  ariaLabelledBy?: string;
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
    withGifSupport,
    withCTAButton,
    onBlur,
    altTextLabel,
    imageTitleLabel,
    ariaLabelledBy,
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
                  // Our Modal component (UI/Modal) uses z-index 1000001.
                  // Override the library default (9999) so the alt text
                  // modal renders above it.
                  styles: {
                    modalBackground: {
                      zIndex: 1000002,
                    },
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
      ...(withGifSupport && {
        uploader: {
          mimetypes: ['image/png', 'image/jpeg', 'image/gif'],
        },
      }),
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
        fileInput.setAttribute(
          'accept',
          withGifSupport
            ? 'image/png, image/jpeg, image/gif'
            : 'image/png, image/jpeg'
        );
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

  // add border HTML attribute to the editor container for CSS Disabled mode
  editorContainer.style.border = '1px solid #808080';

  // Apply correct attributes for a11y
  const editor = editorContainer.getElementsByClassName('ql-editor')[0];

  editor.setAttribute('name', id);
  editor.setAttribute('id', id);
  if (ariaLabelledBy) {
    editor.setAttribute('aria-labelledby', ariaLabelledBy);
  }
  editor.setAttribute('aria-multiline', 'true');
  editor.setAttribute('role', 'textbox');

  // add aria-labels to dropdown items for a11y
  const pickerItems = document.querySelectorAll('.ql-picker-item');
  pickerItems.forEach((item) => {
    const label = item.getAttribute('data-label');
    if (label) {
      item.setAttribute('aria-label', label);
    }
  });

  const toolbarElement = document.getElementById(toolbarId);
  if (toolbarElement) {
    // set width and height as HTML attributes (not relying on CSS)
    toolbarElement.querySelectorAll('svg').forEach((svg) => {
      svg.setAttribute('width', '18');
      svg.setAttribute('height', '18');
    });

    // convert button labels to visually-hidden text (.ql-sr-only) to appear when CSS is disabled.
    toolbarElement.querySelectorAll('button[aria-label]').forEach((btn) => {
      const label = btn.getAttribute('aria-label');
      if (label && !btn.querySelector('.ql-sr-only')) {
        const span = document.createElement('span');
        span.className = 'ql-sr-only';
        span.textContent = label;
        btn.appendChild(span);
      }
    });

    // Close when focus moves outside the picker for keyboard and screen reader users.
    toolbarElement.querySelectorAll('.ql-picker').forEach((picker) => {
      picker
        .querySelectorAll<HTMLElement>('.ql-picker-item')
        .forEach((item) => {
          item.tabIndex = -1;
        });

      picker.addEventListener('focusout', (event) => {
        const nextFocused = (event as FocusEvent).relatedTarget as Node | null;
        if (nextFocused && picker.contains(nextFocused)) return;

        picker.classList.remove('ql-expanded');
        picker
          .querySelector('.ql-picker-label')
          ?.setAttribute('aria-expanded', 'false');
        picker
          .querySelector('.ql-picker-options')
          ?.setAttribute('aria-hidden', 'true');
      });
    });
  }

  return quill;
};
