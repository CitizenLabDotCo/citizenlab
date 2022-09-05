// Implementation inspired by:
// https://quilljs.com/guides/cloning-medium-with-parchment/
// https://gist.github.com/tranduongms1/584d43ec7d8ddeab458f087adbeef950

import Quill, { QuillOptionsStatic } from 'quill';

const Module = Quill.import('core/module');
const BaseImageFormat = Quill.import('formats/image');
const BlockEmbed = Quill.import('blots/block/embed');

export const attributes = ['alt', 'width', 'height', 'style'];

// Create a custom ImageBlot that allows us to add alt text to the image
export class ImageBlot extends BaseImageFormat {
  static blotName = 'image';
  // Instead of using the default img tag, we are using a div where we can add an input field for the alt text
  static tagName = ['span'];
  // We are setting a custom class on the div so that we can reference it later on
  static className = 'ql-alt-text-input-container';

  static create(value: string) {
    // The node with tag div is created
    const node: HTMLSpanElement = super.create();
    // Next, need to create and add an img tag to it with the src attribute
    const img: HTMLImageElement = window.document.createElement('img');
    if (typeof value === 'string') {
      img.setAttribute('src', value);
      img.setAttribute('class', `${node.getAttribute('class')} ` + `keepHTML`);
      img.setAttribute('alt', '');
    }
    if (value) {
      node.appendChild(img);
    }
    return node;
  }

  constructor(
    domNode: HTMLSpanElement & { onSelect: () => void; onDeselect: () => void }
  ) {
    super(domNode);
    const img = domNode.querySelector('img');
    // We are creating an input field for the alt text and setting the necessary attributes
    const altInput = window.document.createElement('input');
    altInput.setAttribute('type', 'text');
    altInput.setAttribute('class', 'ql-alt-text-input');
    altInput.setAttribute(
      'style',
      'display: block; width:100%; border: 1px solid #ccc; border-radius: 3px; padding: 5px; margin-bottom:4px;'
    );
    altInput.setAttribute('value', img?.getAttribute('alt') || '');
    // Handle change of input field value
    const handleChange = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      img?.setAttribute('alt', target.value);
    };

    // We are adding the input field to the blot
    domNode.prepend(altInput);
    // When the blot is selected, we are adding the event listener to the input field
    domNode.onSelect = () => {
      altInput.addEventListener('input', handleChange);
    };
    // When the blot is deselected, we are removing the event listener from the input field
    domNode.onDeselect = () => {
      altInput.removeEventListener('input', handleChange);
    };
  }

  static formats(domNode: HTMLSpanElement) {
    // Registering unregistered embed formats (see the attributes constant for the full list) so that Quill can handle them
    return attributes.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name: string, value: string) {
    // Handle embed formats (see the attributes constant for the full list)
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
      img.setAttribute(name, value || '');
    }
  }
}

// Define custom KeepHTML module that allows us to keep the HTML of the image
// including inline styles that otherwise get stripped out by Quill
export class KeepHTML extends BlockEmbed {
  static create(node: HTMLImageElement) {
    return node;
  }
  static value(node: HTMLImageElement) {
    return node;
  }
}

KeepHTML.blotName = 'KeepHTML';
KeepHTML.className = 'keepHTML';
KeepHTML.tagName = 'img';

// Define custom AltTextToImages module
export class AltTextToImagesModule extends Module {
  constructor(quill, options: QuillOptionsStatic) {
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
