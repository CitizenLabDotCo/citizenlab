import React, { useCallback } from 'react';

import {
  Image as ImageComponent,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import { useEditor } from '@craftjs/core';
import useReportDefaultPadding from 'containers/Admin/reporting/hooks/useReportDefaultPadding';
import { Multiloc } from 'typings';

import { IMAGE_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ImageSettings } from 'components/admin/ContentBuilder/Widgets/ImageMultiloc';
import messages from 'components/admin/ContentBuilder/Widgets/ImageMultiloc/messages';
import PageBreakBox from 'components/admin/ContentBuilder/Widgets/PageBreakBox';

// image upload

// events
import eventEmitter from 'utils/eventEmitter';

import useLocalize from 'hooks/useLocalize';

export interface Props {
  image?: {
    dataCode?: string;
    imageUrl?: string;
  };
  alt?: Multiloc;
}

const Image = ({ alt = {}, image }: Props) => {
  const componentDefaultPadding = useReportDefaultPadding();

  const localize = useLocalize();
  const { enabled } = useEditor((state) => {
    return {
      enabled: state.options.enabled,
    };
  });

  const emitImageLoaded = useCallback(() => {
    if (!image?.imageUrl) return;
    eventEmitter.emit(IMAGE_LOADED_EVENT, image?.imageUrl);
  }, [image?.imageUrl]);

  return (
    <PageBreakBox
      width="100%"
      display="flex"
      id="e2e-image"
      style={{ pointerEvents: 'none' }}
      minHeight="26px"
      maxWidth="1200px"
      margin="0 auto"
      px={componentDefaultPadding}
    >
      {image?.imageUrl && (
        <ImageComponent
          width="100%"
          src={image?.imageUrl}
          alt={localize(alt) || ''}
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

Image.craft = {
  related: {
    settings: ImageSettings,
  },
};

export const imageMultilocTitle = messages.imageMultiloc;

export default Image;
