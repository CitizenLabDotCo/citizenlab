import BlotFormatter from '@enzedonline/quill-blot-formatter2';
import Quill from 'quill';

import { isYouTubeEmbedLink } from 'utils/urlUtils';

import { attributes, ImageBlot, KeepHTML } from './altTextToImagesModule';

export const configureQuill = () => {
  Quill.register('modules/blotFormatter', BlotFormatter);

  // BEGIN allow video resizing styles
  const BaseVideoFormat = Quill.import('formats/video') as any;
  class VideoFormat extends BaseVideoFormat {
    static create(url: string) {
      const node = super.create(url);

      // Add referrer policy to YouTube video embeds
      if (isYouTubeEmbedLink(url)) {
        node.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      }

      return node;
    }

    static formats(domNode) {
      return attributes.reduce((formats, attribute) => {
        if (domNode.hasAttribute(attribute)) {
          formats[attribute] = domNode.getAttribute(attribute);
        }
        return formats;
      }, {});
    }
    format(name, value) {
      if (attributes.indexOf(name) > -1) {
        if (value) {
          this.domNode.setAttribute(name, value);
        } else {
          this.domNode.removeAttribute(name);
        }
      } else {
        super.format(name, value);
      }
    }
  }
  VideoFormat.blotName = 'video';
  VideoFormat.tagName = 'iframe';
  Quill.register(VideoFormat, true);
  // END allow video resizing styles

  // BEGIN function to detect whether urls are external
  // inspired by https://github.com/quilljs/quill/blob/develop/formats/link.js#L33
  const ALLOWED_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel']);

  function isExternal(url: string) {
    const protocol = url.slice(0, url.indexOf(':'));
    return ALLOWED_PROTOCOLS.has(protocol);
  }
  // END function to detect whether urls are external

  // BEGIN custom link implementation
  const Link = Quill.import('formats/link') as any;

  class CustomLink extends Link {
    static create(url: string) {
      const node = super.create(url);
      node.setAttribute('rel', 'noreferrer noopener nofollow');

      // if the href of node starts with www., add https://
      if (url.startsWith('www.')) {
        node.setAttribute('href', `https://${url}`);
      }

      // The default behavior of the Link is to add a target="_blank" attribute
      // So for internal urls we have to remove this
      if (!isExternal(url)) {
        node.removeAttribute('target');
      }

      return node;
    }
  }

  Quill.register('formats/link', CustomLink);
  // END custom link implementation

  // BEGIN custom button implementation
  const Inline = Quill.import('blots/inline') as any;

  class CustomButton extends Inline {
    static create(url: string) {
      const node = super.create();
      node.setAttribute('href', url);
      node.setAttribute('rel', 'noorefferer');

      if (isExternal(url)) {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noreferrer noopener nofollow');
      }

      return node;
    }

    static formats(node) {
      return node.getAttribute('href');
    }
  }
  CustomButton.blotName = 'button';
  CustomButton.tagName = 'a';
  CustomButton.className = 'custom-button';

  Quill.register(CustomButton);
  // END custom button implementation

  Quill.register('formats/image', ImageBlot, true);

  Quill.register(KeepHTML);
};
