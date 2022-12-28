import React from 'react';

import { SectionField, SubSectionTitle } from 'components/admin/Section';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { HEADER_BG_ASPECT_RATIO } from 'services/projects';
import ImageInfoTooltip from 'components/admin/ImageCropper/ImageInfoTooltip';

interface Props {
  image: UploadFile[] | null;
  onImageAdd: (newHeader: UploadFile[]) => void;
  onImageRemove: () => void;
}

export default ({ image, onImageAdd, onImageRemove }: Props) => (
  <SectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.headerImageInputLabel} />
      <ImageInfoTooltip />
    </SubSectionTitle>
    <ImagesDropzone
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      images={image}
      imagePreviewRatio={1 / HEADER_BG_ASPECT_RATIO}
      onAdd={onImageAdd}
      onRemove={onImageRemove}
    />
  </SectionField>
);
