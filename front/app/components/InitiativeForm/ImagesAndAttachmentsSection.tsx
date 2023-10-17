import React from 'react';
import FileUploader from 'components/HookForm/FileUploader';
import ImagesDropzone from 'components/HookForm/ImagesDropzone';
import {
  FormSection,
  FormSectionTitle,
  FormLabel,
} from 'components/UI/FormComponents';
import messages from './messages';
import { SectionField } from 'components/admin/Section';
import { Box } from '@citizenlab/cl2-component-library';
import ContentUploadDisclaimerTooltip from 'components/ContentUploadDisclaimer';

const ImageAndAttachmentsSection = () => {
  return (
    <FormSection>
      <Box display="flex" gap="8px">
        <FormSectionTitle message={messages.formAttachmentsSectionTitle} />
        <Box mt='20px'>
        <ContentUploadDisclaimerTooltip />
        </Box>
      </Box>
      <SectionField id="e2e-iniatiative-banner-dropzone">
        <FormLabel
          labelMessage={messages.bannerUploadLabel}
          subtextMessage={messages.bannerUploadLabelSubtext}
          htmlFor="header_bg"
          optional
        />
        <ImagesDropzone
          name="header_bg"
          imagePreviewRatio={360 / 1440}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
        />
      </SectionField>
      <SectionField id="e2e-iniatiative-img-dropzone">
        <FormLabel
          labelMessage={messages.imageUploadLabel}
          subtextMessage={messages.imageUploadLabelSubtext}
          htmlFor="images"
          optional
        />
        <ImagesDropzone
          name="images"
          imagePreviewRatio={135 / 298}
          acceptedFileTypes={{
            'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          }}
        />
      </SectionField>
      <SectionField>
        <FormLabel
          labelMessage={messages.fileUploadLabel}
          subtextMessage={messages.fileUploadLabelSubtext}
          htmlFor="local_initiative_files"
          optional
        >
          <FileUploader name="local_initiative_files" />
        </FormLabel>
      </SectionField>
    </FormSection>
  );
};

export default ImageAndAttachmentsSection;
