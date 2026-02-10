// Implementation inspired by:
// https://quilljs.com/guides/cloning-medium-with-parchment/
// https://gist.github.com/tranduongms1/584d43ec7d8ddeab458f087adbeef950

import Quill, { QuillOptions } from 'quill';

import { getPlaceHolder } from './utils';

const Module = Quill.import('core/module') as any;
const BaseImageFormat = Quill.import('formats/image') as any;

export const attributes = ['alt', 'width', 'height', 'style'];

// The blot's domNode is a <span> container holding both the <img> and an
// alt-text <input>. Parchment manages domNode positioning, so wrapping at
// runtime (e.g. in attach()) breaks its parent-child assumptions.
export class ImageBlot extends BaseImageFormat {
  static blotName = 'image';
  static tagName = 'span';
  static className = 'ql-alt-text-input-container';

  static create(value: string) {
    const node = document.createElement('span');
    node.classList.add('ql-alt-text-input-container');

    const img = document.createElement('img');
    if (typeof value === 'string') {
      img.setAttribute('src', value);
      img.setAttribute('alt', '');
    }

    const altInput = document.createElement('input');
    altInput.setAttribute('type', 'text');
    altInput.setAttribute('class', 'ql-alt-text-input');
    altInput.setAttribute(
      'style',
      'display: block; width:100%; border: 1px solid #ccc; border-radius: 3px; padding: 5px; margin-bottom:4px;'
    );
    altInput.setAttribute('value', img.getAttribute('alt') || '');
    altInput.setAttribute('placeholder', getPlaceHolder());

    // Prevent Quill 2.0 from intercepting input events (keyboard, editor,
    // and selection modules all listen on the editor root).
    const stopPropagation = (e: Event) => e.stopPropagation();
    altInput.addEventListener('keydown', stopPropagation);
    altInput.addEventListener('keyup', stopPropagation);
    altInput.addEventListener('beforeinput', stopPropagation);
    altInput.addEventListener('mousedown', stopPropagation);

    // Pause Quill's MutationObserver while syncing alt text, otherwise
    // Quill processes the DOM change and steals focus from the input.
    let scrollRef: any = null;
    altInput.addEventListener('input', (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (scrollRef) {
        scrollRef.observer.disconnect();
        img.setAttribute('alt', target.value);
        scrollRef.observer.observe(scrollRef.domNode, {
          attributes: true,
          characterData: true,
          characterDataOldValue: true,
          childList: true,
          subtree: true,
        });
      } else {
        img.setAttribute('alt', target.value);
      }
    });

    node.appendChild(altInput);
    node.appendChild(img);

    (node as any).onSelect = (quill: Quill) => {
      scrollRef = quill.scroll;
      altInput.focus();
    };
    (node as any).onDeselect = () => {
      scrollRef = null;
      altInput.blur();
    };

    return node;
  }

  static value(domNode: HTMLSpanElement) {
    return domNode.querySelector('img')?.getAttribute('src') || '';
  }

  static formats(domNode: HTMLSpanElement) {
    const img = domNode.querySelector('img');
    return attributes.reduce((formats, attribute) => {
      if (img?.hasAttribute(attribute)) {
        formats[attribute] = img.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  // Do not override instance value() — LeafBlot.value() wraps the result
  // as { image: url }, which is required for Delta serialization.

  format(name: string, value: string | null) {
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

    if (name === 'alt') {
      altInput?.setAttribute('value', value ?? '');
      img?.setAttribute(name, value || '');
    }
  }
}

// Preserves inline styles on images that Quill would otherwise strip.
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

// Handles click-to-edit alt text on images. Uses Quill.find()
// (Parchment 3.0 API) instead of the removed __blot DOM property.
export class AltTextToImagesModule extends Module {
  constructor(quill: Quill, options: QuillOptions) {
    super(quill, options);

    const listener = (e: MouseEvent) => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener('click', listener);
      }
      const target = e.target as Element;
      const elm = target.closest('.ql-alt-text-input-container');

      const deselect = () => {
        (elm as any).onDeselect();
        const blot = elm ? Quill.find(elm as Node) : null;
        if (blot) {
          quill.setSelection(
            quill.getIndex(blot as any) + 1,
            0,
            Quill.sources.USER
          );
        }
      };

      const blot = elm ? Quill.find(elm as Node) : null;

      if (elm && blot && (elm as any).onSelect) {
        (elm as any).onSelect(quill);

        const handleClick = (e: MouseEvent) => {
          if (!elm.contains(e.target as Node)) {
            deselect();
            window.removeEventListener('click', handleClick);
          }
        };
        window.addEventListener('click', handleClick);
      }
    };
    quill.emitter.listenDOM('click', document.body, listener);
  }
}
