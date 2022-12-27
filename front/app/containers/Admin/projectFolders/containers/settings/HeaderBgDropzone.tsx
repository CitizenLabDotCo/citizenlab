import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { UploadFile } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  image: UploadFile[] | null;
  onImageAdd: (newHeader: UploadFile[]) => void;
  onImageRemove: () => void;
}

export default ({ image, onImageAdd, onImageRemove }: Props) => (
  <SectionField>
    <SubSectionTitle>
      <FormattedMessage {...messages.headerImageInputLabel} />
      <IconTooltip
        content={
          <FormattedMessage
            {...messages.projectFolderHeaderImageLabelTooltip}
          />
        }
      />
    </SubSectionTitle>
    <ImagesDropzone
      acceptedFileTypes={{
        'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      }}
      images={image}
      imagePreviewRatio={250 / 1380}
      onAdd={onImageAdd}
      onRemove={onImageRemove}
    />
  </SectionField>
);
