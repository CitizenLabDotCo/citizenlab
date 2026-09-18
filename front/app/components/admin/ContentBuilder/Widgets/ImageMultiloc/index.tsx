import React, { lazy, useCallback } from 'react';

import {
  Image as ImageComponent,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { IMAGE_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

import eventEmitter from 'utils/eventEmitter';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import PageBreakBox from '../PageBreakBox';

import messages from './messages';

export interface Props {
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
  alt?: Multiloc;
}

const Image = ({ alt = {}, image }: Props) => {
  const componentDefaultPadding = useCraftComponentDefaultPadding();

  const localize = useLocalize();
  const { enabled } = useEditor((state) => {
    return {
      enabled: state.options.enabled,
    };
  });

  const emitImageLoaded = useCallback(() => {
    if (!image?.imageUrl) return;
    eventEmitter.emit(IMAGE_LOADED_EVENT, image.imageUrl);
  }, [image?.imageUrl]);

  return (
    <PageBreakBox
      width="100%"
      display="flex"
      className="e2e-image"
      pointerEvents="none"
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {image?.imageUrl && (
        <ImageComponent
          width="100%"
          src={image.imageUrl}
          alt={localize(alt) || ''}
          data-code={image.dataCode}
          onLoad={emitImageLoaded}
          // A broken image never fires onLoad; report it anyway so the
          // page-level wait for images can finish.
          onError={emitImageLoaded}
        />
      )}
      {/* In edit view, show an image placeholder if image is not set. */}
      {!image?.imageUrl && enabled && (
        <Icon
          margin="auto"
          padding="24px"
          width="100px"
          height="100px"
          fill={colors.grey500}
          name="image"
        />
      )}
    </PageBreakBox>
  );
};

// Lazy, as the settings (image upload) are only needed in the builder, not on the
// pages showing the widget.
const ImageSettings = lazy(() => import('./Settings'));

Image.craft = {
  related: {
    settings: ImageSettings,
  },
  custom: {
    title: messages.imageMultiloc,
  },
};

export const imageMultilocTitle = messages.imageMultiloc;

export default Image;
