import Quill, { QuillOptionsStatic } from 'quill';

const Module = Quill.import('core/module');
const BlockEmbed = Quill.import('blots/block/embed');

export class ImageBlot extends BlockEmbed {
  static blotName = 'image';
  static tagName = ['div'];

  static create(value) {
    const node = super.create();
    const img = window.document.createElement('img');
    img.setAttribute('alt', value.alt || '');

    if (value.src || typeof value === 'string') {
      img.setAttribute('src', value.src || value);
    }

    node.appendChild(img);
    node.setAttribute('class', 'ql-alt-text-input-container');

    return node;
  }

  constructor(node) {
    super(node);
    const img = node.querySelector('img');
    const altInput = window.document.createElement('input');
    altInput.setAttribute('type', 'text');
    altInput.setAttribute('class', 'ql-alt-text-input');
    altInput.setAttribute('value', img.getAttribute('alt'));
    altInput.setAttribute(
      'style',
      'display: block; border: 1px solid #ccc; border-radius: 3px; padding: 5px; margin-bottom:4px;'
    );

    const handleBlur = () => {
      const value = altInput.value;
      img.setAttribute('alt', value);
      altInput.removeEventListener('blur', handleBlur);
    };

    node.prepend(altInput);

    node.onSelect = () => {
      altInput.addEventListener('blur', handleBlur);
      altInput.focus();
    };
  }

  static value(node: HTMLElement) {
    const img = node.querySelector('img');
    if (!img) return false;
    return {
      alt: img.getAttribute('alt'),
      src: img.getAttribute('src'),
    };
  }
}

export class AltTextToImagesModule extends Module {
  constructor(quill, options: QuillOptionsStatic) {
    super(quill, options);

    const listener = (e) => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener('click', listener);
      }

      const elm = e.target.closest('.ql-alt-text-input-container');

      const deselect = () => {
        quill.setSelection(
          quill.getIndex(elm.__blot.blot) + 1,
          0,
          Quill.sources.USER
        );
      };

      if (elm && elm.__blot && elm.onSelect) {
        quill.disable();
        elm.onSelect(quill);

        const handleClick = (e: MouseEvent) => {
          if (!elm.contains(e.target)) {
            window.removeEventListener('click', handleClick);
            quill.enable(true);
            deselect();
          }
        };
        window.addEventListener('click', handleClick);
      }
    };
    quill.emitter.listenDOM('click', document.body, listener);
  }
}
