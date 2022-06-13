import React from 'react';
import styled from 'styled-components';

// components
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import { StyledSectionField } from './styling';
import ImagesDropzone from 'components/UI/ImagesDropzone';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { UploadFile } from 'typings';

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
  }: Props & InjectedIntlProps) => (
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
        acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
        maxImagePreviewWidth="500px"
        onAdd={handleHeaderOnAdd}
        onRemove={handleHeaderOnRemove}
      />
    </StyledSectionField>
  )
);
