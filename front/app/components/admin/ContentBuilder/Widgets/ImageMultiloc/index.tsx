import React, { useState, useEffect, useCallback } from 'react';

// components
import {
  Box,
  Image as ImageComponent,
  colors,
  Icon,
  Label,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import PageBreakBox from '../PageBreakBox';

// image upload
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { convertUrlToUploadFile } from 'utils/fileUtils';
import { Multiloc, UploadFile } from 'typings';

// craft
import { useEditor, useNode } from '@craftjs/core';
import useCraftComponentDefaultPadding from '../../useCraftComponentDefaultPadding';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';

// events
import eventEmitter from 'utils/eventEmitter';
import {
  IMAGE_UPLOADING_EVENT,
  IMAGE_LOADED_EVENT,
} from 'components/admin/ContentBuilder/constants';

// hooks
import useAddContentBuilderImage from 'api/content_builder_images/useAddContentBuilderImage';
import useLocalize from 'hooks/useLocalize';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

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

export default Image;
