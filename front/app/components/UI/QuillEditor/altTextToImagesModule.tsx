import Quill, { QuillOptionsStatic } from 'quill';

const Module = Quill.import('core/module');
const BlockEmbed = Quill.import('blots/block/embed');

export const attributes = ['alt', 'width', 'height', 'style'];

export class ImageBlot extends BlockEmbed {
  static blotName = 'image';
  static tagName = ['div'];

  static create(value: { alt: string; src: string } | string) {
    const node = super.create();
    const img = window.document.createElement('img');
    if (typeof value === 'string') {
      img.setAttribute('src', value);
      img.setAttribute('alt', '');
    } else {
      img.setAttribute('alt', value.alt);
      img.setAttribute('src', value.src);
    }

    node.appendChild(img);
    node.setAttribute('class', 'ql-alt-text-input-container');

    return node;
  }

  constructor(domNode: HTMLDivElement & { onSelect: () => void }) {
    super(domNode);
    const img = domNode.querySelector('img');
    const altInput = window.document.createElement('input');
    altInput.setAttribute('type', 'text');
    altInput.setAttribute('class', 'ql-alt-text-input');
    altInput.setAttribute('value', img?.getAttribute('alt') || '');
    altInput.setAttribute(
      'style',
      'display: block; width:100%; border: 1px solid #ccc; border-radius: 3px; padding: 5px; margin-bottom:4px;'
    );

    const handleBlur = () => {
      const value = altInput.value;
      img?.setAttribute('alt', value);
      altInput.removeEventListener('blur', handleBlur);
    };

    domNode.prepend(altInput);

    domNode.onSelect = () => {
      altInput.addEventListener('blur', handleBlur);
      altInput.focus();
    };
  }

  static value(domNode: HTMLElement) {
    const img = domNode.querySelector('img');
    if (!img) return false;
    return {
      alt: img.getAttribute('alt'),
      src: img.getAttribute('src'),
    };
  }

  static formats(domNode: HTMLDivElement) {
    return attributes.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name: string, value: string) {
    const img = this.domNode.querySelector('img');
    const altInput = this.domNode.querySelector('input');

    if (attributes.indexOf(name) > -1) {
      if (value) {
        img.setAttribute(name, value);
      } else {
        img.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }

    // Ensure that there is always an alt attribute
    if (name === 'alt') {
      altInput.setAttribute('value', value);
      img.setAttribute(name, '');
    }
  }
}

export class AltTextToImagesModule extends Module {
  constructor(quill, options: QuillOptionsStatic) {
    super(quill, options);

    const listener = (e) => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener('click', listener);
      }

      const elm = e?.target?.closest('.ql-alt-text-input-container');

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
