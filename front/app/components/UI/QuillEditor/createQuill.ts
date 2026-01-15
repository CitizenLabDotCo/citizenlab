import Quill from 'quill';

import { attributes } from './altTextToImagesModule';

/**
 * WORKAROUND: Fix toolbar dropdown selection loss in development mode.
 *
 * THE PROBLEM:
 * In dev mode (likely due to HMR/Hot Module Replacement), when you:
 * 1. Select text in the editor
 * 2. Click on a toolbar dropdown (e.g., "Title" dropdown)
 * 3. Click on an option (e.g., "Title")
 *
 * The editor loses focus between steps 2 and 3, which clears the selection.
 * When Quill tries to apply the format, there's no selection, so nothing happens.
 * This works fine in production builds.
 *
 * THE FIX:
 * 1. Save the selection whenever text is selected
 * 2. Intercept clicks on dropdown items before Quill handles them
 * 3. Restore the saved selection
 * 4. Manually apply the format
 * 5. Close the dropdown
 */
const fixDevModeDropdowns = (quill: Quill) => {
  // Store the last known cursor position or selection
  let savedSelection: any = null;

  // Step 1: Save selection/cursor position whenever it changes
  quill.on('selection-change', (range: any) => {
    if (range) savedSelection = range;
  });

  const toolbar = quill.getModule('toolbar');

  // Find all dropdown items
  toolbar?.container
    ?.querySelectorAll('.ql-picker-item')
    .forEach((item: Element) => {
      item.addEventListener(
        'click',
        (e: Event) => {
          // Only intervene if we have a saved selection/cursor position
          if (!savedSelection) return;

          quill.setSelection(savedSelection);

          const target = e.target as HTMLElement;
          const picker = target.closest('.ql-picker');
          if (!picker) return;

          // Extract format from picker class (e.g., "ql-header" -> "header")
          const ignoredClasses = ['ql-picker', 'ql-expanded'];
          const format = Array.from(picker.classList)
            .find((c) => c.startsWith('ql-') && !ignoredClasses.includes(c))
            ?.slice(3); // Remove "ql-" prefix
          const value = target.dataset.value;

          if (format) {
            quill.format(format, value || false);
            picker.classList.remove('ql-expanded');
          }
        },
        true
      ); // 'true' = capture phase, runs before Quill's handler
    });
};

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

  // Apply dev mode dropdown fix
  if (import.meta.env.DEV) {
    fixDevModeDropdowns(quill);
  }

  return quill;
};
