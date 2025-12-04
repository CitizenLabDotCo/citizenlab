// Implementation inspired by:
// https://quilljs.com/guides/cloning-medium-with-parchment/
// https://gist.github.com/tranduongms1/584d43ec7d8ddeab458f087adbeef950

import Quill, { QuillOptions } from 'quill';

import { getPlaceHolder } from './utils';

const Module = Quill.import('core/module') as any;
const BaseImageFormat = Quill.import('formats/image') as any;

export const attributes = ['alt', 'width', 'height', 'style'];

// Create a custom ImageBlot that allows us to add alt text to the image
export class ImageBlot extends BaseImageFormat {
  static blotName = 'image';
  // Keep the default img tag
  static tagName = 'img';
  // No custom className to avoid conflicts

  static create(value: string) {
    // Use the default image creation
    const img = super.create(value) as HTMLImageElement;
    return img;
  }

  attach() {
    super.attach();
    const img = this.domNode as HTMLImageElement;

    // Create a wrapper span for the alt text input
    const wrapper = document.createElement('span');
    wrapper.setAttribute('class', 'ql-alt-text-input-container');

    // Move the img into the wrapper
    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img);

    // Only add alt input if it doesn't already exist
    if (!wrapper.querySelector('.ql-alt-text-input')) {
      // We are creating an input field for the alt text and setting the necessary attributes
      const altInput = window.document.createElement('input');
      altInput.setAttribute('type', 'text');
      altInput.setAttribute('class', 'ql-alt-text-input');
      altInput.setAttribute(
        'style',
        'display: block; width:100%; border: 1px solid #ccc; border-radius: 3px; padding: 5px; margin-bottom:4px;'
      );
      altInput.setAttribute('value', img.getAttribute('alt') || '');

      // Set placeholder
      altInput.setAttribute('placeholder', getPlaceHolder());

      // Handle change of input field value
      const handleChange = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        img.setAttribute('alt', target.value);
      };

      // We are adding the input field to the wrapper
      wrapper.prepend(altInput);
      // When the blot is selected, we are adding the event listener to the input field
      (wrapper as any).onSelect = () => {
        altInput.addEventListener('input', handleChange);
      };
      // When the blot is deselected, we are removing the event listener from the input field
      (wrapper as any).onDeselect = () => {
        altInput.removeEventListener('input', handleChange);
      };
    }
  }

  static value(domNode: HTMLImageElement) {
    return domNode.getAttribute('src') || '';
  }

  static formats(domNode: HTMLImageElement) {
    // Registering unregistered embed formats (see the attributes constant for the full list) so that Quill can handle them
    return attributes.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  value() {
    return (this.constructor as typeof ImageBlot).value(
      this.domNode as HTMLImageElement
    );
  }

  format(name: string, value: string) {
    // Handle embed formats (see the attributes constant for the full list)
    const img = this.domNode as HTMLImageElement;
    const wrapper = img.parentElement;
    const altInput = wrapper?.querySelector('.ql-alt-text-input');

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
      altInput?.setAttribute('value', value);
      img.setAttribute(name, value || '');
    }
  }
}

// Define custom KeepHTML module that allows us to keep the HTML of the image
// including inline styles that otherwise get stripped out by Quill
export class KeepHTML extends BaseImageFormat {
  static blotName = 'KeepHTML';
  static className = 'keepHTML';
  static tagName = 'img';

  static create(node: HTMLImageElement) {
    return node;
  }
  static value(node: HTMLImageElement) {
    return node;
  }
}

// Define custom AltTextToImages module
export class AltTextToImagesModule extends Module {
  constructor(quill: Quill, options: QuillOptions) {
    super(quill, options);

    const listener = (e) => {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener('click', listener);
      }
      // Find image blot element
      const elm = e?.target?.closest('.ql-alt-text-input-container');

      // Deselect callback
      const deselect = () => {
        elm.onDeselect();
        quill.setSelection(
          quill.getIndex(elm.__blot.blot) + 1,
          0,
          Quill.sources.USER
        );
      };
      // Handle blot select
      if (elm && elm.__blot && elm.onSelect) {
        quill.disable();
        elm.onSelect(quill);

        const handleClick = (e: MouseEvent) => {
          // Handle blot deselect
          if (!elm.contains(e.target)) {
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
