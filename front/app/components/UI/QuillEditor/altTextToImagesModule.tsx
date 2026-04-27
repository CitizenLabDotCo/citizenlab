import Image from 'quill/formats/image';

export const attributes = ['alt', 'title', 'width', 'height', 'style'];

// Extend the default Image blot to preserve alt, title, width, height,
// and style attributes through Quill's format system. Alt text and title
// are edited via blot-formatter2's built-in dialog.
export class ImageBlot extends Image {
  static blotName = 'image';
  static tagName = 'img';

  static formats(domNode: HTMLImageElement) {
    return attributes.reduce<Record<string, string>>((formats, attribute) => {
      const value = domNode.getAttribute(attribute);
      if (value !== null) formats[attribute] = value;
      return formats;
    }, {});
  }

  format(name: string, value: string) {
    if (attributes.indexOf(name) > -1) {
      const node = this.domNode as HTMLImageElement;
      if (!value) {
        node.removeAttribute(name);
        return;
      }
      // The HTML `width` and `height` attributes must be unitless integers per
      // the HTML spec. Email clients (notably Gmail) drop attributes that
      // include a unit like "270px", which is what blot-formatter2 emits and
      // is the root cause of TAN-7245. Normalize on write.
      if (name === 'width' || name === 'height') {
        const numeric = String(value).match(/^(\d+)(?:\s*px)?$/);
        if (numeric) {
          node.setAttribute(name, numeric[1]);
          return;
        }
        // Non-pixel values (e.g. "auto", "50%") are invalid as HTML attrs.
        // Drop the attr; the value can still be expressed via inline style.
        node.removeAttribute(name);
        return;
      }
      node.setAttribute(name, value);
    } else {
      super.format(name, value);
    }
  }
}

// Preserves inline styles on images that Quill would otherwise strip.
export class KeepHTML extends Image {
  static blotName = 'KeepHTML';
  static className = 'keepHTML';
  static tagName = 'img';

  static create(value: string | Node): Element {
    if (value instanceof Node) return value as Element;
    return super.create(value as string);
  }
  static value(node: HTMLImageElement) {
    return node.getAttribute('src') || '';
  }
}
