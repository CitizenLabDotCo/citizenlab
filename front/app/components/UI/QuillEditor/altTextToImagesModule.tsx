// Implementation inspired by:
// https://quilljs.com/guides/cloning-medium-with-parchment/
// https://gist.github.com/tranduongms1/584d43ec7d8ddeab458f087adbeef950

import Quill, { QuillOptions } from 'quill';

import { getPlaceHolder } from './utils';

const Module = Quill.import('core/module') as any;
const BaseImageFormat = Quill.import('formats/image') as any;

export const attributes = ['alt', 'width', 'height', 'style'];

// Create a custom ImageBlot that allows us to add alt text to the image.
// The blot's domNode is a <span> container that holds both the <img> and
// an alt-text <input>. This is necessary because Parchment manages the
// domNode's position in the DOM tree — wrapping it at runtime (e.g. in
// attach()) breaks Parchment's assumptions about parent-child relationships.
export class ImageBlot extends BaseImageFormat {
  static blotName = 'image';
  static tagName = 'span';
  static className = 'ql-alt-text-input-container';

  static create(value: string) {
    // Create the span container (the blot's domNode, managed by Parchment)
    const node = document.createElement('span');
    node.classList.add('ql-alt-text-input-container');

    // Create the img as a child element
    const img = document.createElement('img');
    if (typeof value === 'string') {
      img.setAttribute('src', value);
      img.setAttribute('alt', '');
    }

    // Create the alt text input field
    const altInput = document.createElement('input');
    altInput.setAttribute('type', 'text');
    altInput.setAttribute('class', 'ql-alt-text-input');
    altInput.setAttribute(
      'style',
      'display: block; width:100%; border: 1px solid #ccc; border-radius: 3px; padding: 5px; margin-bottom:4px;'
    );
    altInput.setAttribute('value', img.getAttribute('alt') || '');
    altInput.setAttribute('placeholder', getPlaceHolder());

    // Handle change of input field value
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      img.setAttribute('alt', target.value);
    };

    // Build the DOM structure: [altInput, img] inside the span
    node.appendChild(altInput);
    node.appendChild(img);

    // Set up select/deselect callbacks on the node (used by AltTextToImagesModule)
    (node as any).onSelect = () => {
      altInput.addEventListener('input', handleChange);
    };
    (node as any).onDeselect = () => {
      altInput.removeEventListener('input', handleChange);
    };

    return node;
  }

  static value(domNode: HTMLSpanElement) {
    return domNode.querySelector('img')?.getAttribute('src') || '';
  }

  static formats(domNode: HTMLSpanElement) {
    const img = domNode.querySelector('img');
    // Read format attributes from the child <img>, not the span container
    return attributes.reduce((formats, attribute) => {
      if (img?.hasAttribute(attribute)) {
        formats[attribute] = img.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  // No instance value() override — the inherited LeafBlot.value() correctly
  // wraps the result as { image: staticValue }, which is required for Delta
  // serialization (undo/redo, getContents, copy-paste).

  format(name: string, value: string) {
    // Apply format attributes to the child <img>
    const img = (this.domNode as HTMLSpanElement).querySelector('img');
    const altInput = (this.domNode as HTMLSpanElement).querySelector(
      '.ql-alt-text-input'
    );

    if (attributes.indexOf(name) > -1) {
      if (value) {
        img?.setAttribute(name, value);
      } else {
        img?.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }

    // Ensure that there is always an alt attribute
    if (name === 'alt') {
      altInput?.setAttribute('value', value);
      img?.setAttribute(name, value || '');
    }
  }
}

// Define custom KeepHTML blot that preserves the HTML of images
// including inline styles that otherwise get stripped out by Quill
export class KeepHTML extends BaseImageFormat {
  static blotName = 'KeepHTML';
  static className = 'keepHTML';
  static tagName = 'img';

  static create(node: HTMLImageElement) {
    return node;
  }
  static value(node: HTMLImageElement) {
    return node.getAttribute('src') || '';
  }
}

// Define custom AltTextToImages module that handles click-to-edit
// alt text on images. Uses Quill.find() (Parchment 3.0 API) instead
// of the removed __blot DOM property (Parchment 1.x API).
export class AltTextToImagesModule extends Module {
  constructor(quill: Quill, options: QuillOptions) {
    super(quill, options);

    const listener = (e: MouseEvent) => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener('click', listener);
      }
      // Find the image blot's container element
      const elm = (e.target as Element).closest('.ql-alt-text-input-container');

      // Deselect callback
      const deselect = () => {
        (elm as any).onDeselect();
        // Use Quill.find() to look up the blot from the DOM node
        const blot = elm ? Quill.find(elm as Node) : null;
        if (blot) {
          quill.setSelection(
            quill.getIndex(blot as any) + 1,
            0,
            Quill.sources.USER
          );
        }
      };

      // Use Quill.find() to check if the element is a registered blot
      const blot = elm ? Quill.find(elm as Node) : null;
      if (elm && blot && (elm as any).onSelect) {
        quill.disable();
        (elm as any).onSelect(quill);

        const handleClick = (e: MouseEvent) => {
          // Handle blot deselect
          if (!elm.contains(e.target as Node)) {
            deselect();
            quill.enable(true);
            window.removeEventListener('click', handleClick);
          }
        };
        window.addEventListener('click', handleClick);
      }
    };
    quill.emitter.listenDOM('click', document.body, listener);
  }
}
