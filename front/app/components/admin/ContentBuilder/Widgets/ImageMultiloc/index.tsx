import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Image as ImageComponent,
  colors,
  Icon,
  Label,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { useEditor, useNode } from '@craftjs/core';
import { Multiloc, UploadFile } from 'typings';

import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';

import useLocalize from 'hooks/useLocalize';

import {
  IMAGE_UPLOADING_EVENT,
  IMAGE_LOADED_EVENT,
} from 'components/admin/ContentBuilder/constants';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { injectIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { convertUrlToUploadFile } from 'utils/fileUtils';

import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';
import PageBreakBox from '../PageBreakBox';

import messages from './messages';

interface Props {
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
      px={componentDefaultPadding}
    >
      {image?.imageUrl && (
        <ImageComponent
          width="100%"
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

export const ImageSettings = injectIntl(({ intl: { formatMessage } }) => {
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const { mutateAsync: addContentBuilderImage } = useAddContentBuilderImage();
  const {
    actions: { setProp },
    image,
    alt,
  } = useNode((node) => ({
    image: node.data.props.image,
    alt: node.data.props.alt,
  }));

  useEffect(() => {
    if (image?.imageUrl) {
      (async () => {
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, true);
        const imageFile = await convertUrlToUploadFile(image?.imageUrl);
        if (imageFile) {
          setImageFiles([imageFile]);
        }
        eventEmitter.emit(IMAGE_UPLOADING_EVENT, false);
      })();
    }
  }, [image?.imageUrl]);

  const handleOnAdd = async (imageFiles: UploadFile[]) => {
    setImageFiles(imageFiles);

    try {
      const response = await addContentBuilderImage(imageFiles[0].base64);
      setProp((props: Props) => {
        props.image = {
          dataCode: response.data.attributes.code,
          imageUrl: response.data.attributes.image_url,
        };
      });
    } catch {
      // Do nothing
    }
  };

  const handleOnRemove = () => {
    setProp((props: Props) => {
      props.image = {
        dataCode: undefined,
        imageUrl: undefined,
      };
      props.alt = {};
    });
    setImageFiles([]);
  };

  const handleChange = (value: Multiloc) => {
    setProp((props: Props) => (props.alt = value));
  };

  return (
    <Box marginBottom="20px">
      <ImagesDropzone
        images={imageFiles}
        imagePreviewRatio={1 / 2}
        maxImagePreviewWidth="360px"
        objectFit="contain"
        acceptedFileTypes={{
          'image/*': ['.jpg', '.jpeg', '.png'],
        }}
        onAdd={handleOnAdd}
        onRemove={handleOnRemove}
      />
      <Box mb="12px" display={imageFiles.length > 0 ? 'block' : 'none'} />
      <Box mt="16px">
        <Label htmlFor="imageAltTextInput">
          {formatMessage(messages.imageMultilocAltTextLabel)}
          <IconTooltip
            content={formatMessage(messages.imageMultilocAltTextTooltip)}
          />
        </Label>
        <InputMultilocWithLocaleSwitcher
          type="text"
          id="imageAltTextInput"
          onChange={handleChange}
          valueMultiloc={alt}
        />
      </Box>
    </Box>
  );
});

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
