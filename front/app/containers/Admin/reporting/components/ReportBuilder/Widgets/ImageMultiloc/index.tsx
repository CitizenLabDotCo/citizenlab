import React, { useCallback } from 'react';

import {
  Image as ImageComponent,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import { IMAGE_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import messages from 'components/admin/ContentBuilder/Widgets/ImageMultiloc/messages';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

import eventEmitter from 'utils/eventEmitter';

import Settings from './Settings';

export interface Props {
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
  alt?: Multiloc;
  stretch?: boolean;
}

const ImageMultiloc = ({ alt = {}, image, stretch = true }: Props) => {
  const localize = useLocalize();
  const { enabled } = useEditor((state) => {
    return {
      enabled: state.options.enabled,
    };
  });

  const emitImageLoaded = useCallback(() => {
    if (!image?.imageUrl) return;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    eventEmitter.emit(IMAGE_LOADED_EVENT, image?.imageUrl);
  }, [image?.imageUrl]);

  return (
    <PageBreakBox
      width="100%"
      display="flex"
      className="e2e-image"
      style={{ pointerEvents: 'none' }}
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      justifyContent="center"
    >
      {image?.imageUrl && (
        <ImageComponent
          width={stretch ? '100%' : undefined}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          src={image?.imageUrl}
          alt={localize(alt) || ''}
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          data-code={image?.dataCode}
          onLoad={emitImageLoaded}
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

ImageMultiloc.craft = {
  related: {
    settings: Settings,
  },
};

export const imageMultilocTitle = messages.imageMultiloc;

export default ImageMultiloc;
