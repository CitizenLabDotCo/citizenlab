import React from 'react';
// i18n
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
// typings
import { UploadFile } from 'typings';
// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import { SubSectionTitle } from 'components/admin/Section';
import messages from '../messages';
import { StyledSectionField } from './styling';

// Would have loved to put this in styling.ts, but
// that results in some arcane typescript error
// (see https://stackoverflow.com/q/43900035)
const StyledImagesDropzone = styled(ImagesDropzone)`
  margin-top: 2px;
`;

interface Props {
  projectHeaderImage: UploadFile[] | null;
  handleHeaderOnAdd: (newHeader: UploadFile[]) => void;
  handleHeaderOnRemove: () => void;
}

export default injectIntl(
  ({
    projectHeaderImage,
    handleHeaderOnAdd,
    handleHeaderOnRemove,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.headerImageLabelText} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.headerImageLabelTooltip}
              values={{
                imageSupportArticleLink: (
                  <a
                    target="_blank"
                    href={formatMessage(messages.imageSupportArticleLinkTarget)}
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      {...messages.imageSupportArticleLinkText}
                    />
                  </a>
                ),
              }}
            />
          }
        />
      </SubSectionTitle>
      <StyledImagesDropzone
        images={projectHeaderImage}
        imagePreviewRatio={240 / 952}
        acceptedFileTypes={{
          'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
        }}
        maxImagePreviewWidth="500px"
        onAdd={handleHeaderOnAdd}
        onRemove={handleHeaderOnRemove}
      />
    </StyledSectionField>
  )
);
