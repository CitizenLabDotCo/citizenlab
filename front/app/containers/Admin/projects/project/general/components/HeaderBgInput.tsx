import React, { useEffect, useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import cropperMessages from 'containers/Admin/pagesAndMenu/containers/GenericHeroBannerForm/messages';
import ImageCropper from 'components/admin/ImageCropper';
import Warning from 'components/UI/Warning';
import { UploadFile } from 'typings';
import HeaderBgDropzone from './HeaderBgDropzone';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { IProjectFormState } from 'services/projects';
import { convertUrlToUploadFile } from 'utils/fileUtils';

interface Props {
  imageUrl: string | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
}

export default injectIntl(
  ({
    imageUrl,
    onImageChange,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const [projectHeaderImage, setProjectHeaderImage] =
      useState<IProjectFormState['projectHeaderImage']>(null);

    useEffect(() => {
      (async () => {
        const projectHeaderImage = imageUrl
          ? await convertUrlToUploadFile(imageUrl, null, null)
          : null;
        setProjectHeaderImage(projectHeaderImage ? [projectHeaderImage] : null);
      })();
    }, [imageUrl]);

    const handleImageAdd = (newHeader: UploadFile[]) => {
      const newHeaderFile = newHeader[0];

      onImageChange(newHeaderFile.base64);
      setProjectHeaderImage([newHeaderFile]);
    };

    const handleImageRemove = async () => {
      onImageChange(null);
      setProjectHeaderImage(null);
    };

    const imageIsNotSaved = projectHeaderImage && !projectHeaderImage[0].remote;

    return imageIsNotSaved ? (
      <Box display="flex" flexDirection="column" gap="8px">
        <ImageCropper image={projectHeaderImage} onComplete={onImageChange} />
        <Warning>
          <Text>
            <FormattedMessage
              {...cropperMessages.fixedRatioImageCropperInfo}
              values={{
                link: (
                  <a
                    href={formatMessage(cropperMessages.imageSupportPageURL)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      {...cropperMessages.fixedRatioImageCropperInfoLink}
                    />
                  </a>
                ),
              }}
            />
          </Text>
        </Warning>
      </Box>
    ) : (
      <HeaderBgDropzone
        image={projectHeaderImage}
        onImageAdd={handleImageAdd}
        onImageRemove={handleImageRemove}
      />
    );
  }
);
