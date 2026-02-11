import Quill from 'quill';

const BaseImageFormat = Quill.import('formats/image') as any;

export const attributes = ['alt', 'title', 'width', 'height', 'style'];

// Extend the default Image blot to preserve alt, title, width, height,
// and style attributes through Quill's format system. Alt text and title
// are edited via blot-formatter2's built-in dialog.
export class ImageBlot extends BaseImageFormat {
  static blotName = 'image';
  static tagName = 'img';

  static formats(domNode: HTMLImageElement) {
    return attributes.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  format(name: string, value: string | null) {
    if (attributes.indexOf(name) > -1) {
      if (value) {
        (this.domNode as HTMLImageElement).setAttribute(name, value);
      } else {
        (this.domNode as HTMLImageElement).removeAttribute(name);
      }
    } else {
      super.format(name, value);
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
