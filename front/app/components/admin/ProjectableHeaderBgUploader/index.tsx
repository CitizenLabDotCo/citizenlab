import React, { useEffect, useState } from 'react';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Multiloc, UploadFile } from 'typings';

import {
  PROJECTABLE_HEADER_BG_ASPECT_RATIO,
  PROJECTABLE_HEADER_BG_ASPECT_RATIO_HEIGHT,
  PROJECTABLE_HEADER_BG_ASPECT_RATIO_WIDTH,
} from 'api/projects/constants';

import projectMessages from 'containers/Admin/projects/project/general/messages';

import ImageCropperContainer from 'components/admin/ImageCropper/Container';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';
import { convertUrlToUploadFile } from 'utils/fileUtils';

import { SectionField, SubSectionTitle } from '../Section';

interface Props {
  imageUrl: string | null | undefined;
  headerImageAltText: Multiloc | null | undefined;
  onImageChange: (newImageBase64: string | null) => void;
  onHeaderImageAltTextChange: (newHeaderImageAltText: Multiloc) => void;
}

const ProjectableHeaderBgUploader = ({
  imageUrl,
  onImageChange,
  headerImageAltText,
  onHeaderImageAltTextChange,
}: Props) => {
  const [headerBg, setHeaderBg] = useState<UploadFile | null>(null);
  useEffect(() => {
    (async () => {
      if (imageUrl) {
        const headerFile = await convertUrlToUploadFile(imageUrl, null, null);
        setHeaderBg(headerFile || null);
      }
    })();
  }, [imageUrl]);

  const handleImageAdd = (newHeader: UploadFile[]) => {
    const newHeaderFile = newHeader[0];

    onImageChange(newHeaderFile.base64);
    setHeaderBg(newHeaderFile);
  };

  const handleImageRemove = async () => {
    onImageChange(null);
    setHeaderBg(null);
  };

  const imageShouldBeSaved = headerBg ? !headerBg.remote : false;

  return (
    <>
      {imageShouldBeSaved ? (
        <Box display="flex" flexDirection="column" gap="8px">
          <ImageCropperContainer
            image={headerBg}
            onComplete={onImageChange}
            aspectRatioWidth={PROJECTABLE_HEADER_BG_ASPECT_RATIO_WIDTH}
            aspectRatioHeight={PROJECTABLE_HEADER_BG_ASPECT_RATIO_HEIGHT}
            onRemove={handleImageRemove}
            show3x1MobileCropLines={true}
          />
        </Box>
      ) : (
        <ImagesDropzone
          images={headerBg ? [headerBg] : null}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
          imagePreviewRatio={1 / PROJECTABLE_HEADER_BG_ASPECT_RATIO}
          onAdd={handleImageAdd}
          onRemove={handleImageRemove}
        />
      )}
      {headerBg && (
        <SectionField>
          <SubSectionTitle>
            <FormattedMessage {...projectMessages.headerImageAltText} />
            <IconTooltip
              content={
                <FormattedMessage
                  {...projectMessages.projectImageAltTextTooltip}
                />
              }
            />
          </SubSectionTitle>
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={headerImageAltText}
            label={<FormattedMessage {...projectMessages.altText} />}
            onChange={onHeaderImageAltTextChange}
          />
        </SectionField>
      )}
    </>
  );
};

export default ProjectableHeaderBgUploader;
