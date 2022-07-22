import React, { useState } from 'react';

import { UploadFile, CLErrors } from 'typings';

import { injectIntl } from 'utils/cl-intl';

import { API_PATH } from 'containers/App/constants';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';

// components
import FileUploader from 'components/UI/FileUploader';
import { SectionField, SectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';

// resources
import { addIdeaImportFile } from 'services/ideaFiles';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 15px;
  font-size: ${fontSizes.l}px;
  font-weight: bold;
`;

const SectionDescription = styled.div`
  font-size: ${fontSizes.base}px;
`;

const SectionParagraph = styled.p`
  a {
    color: ${colors.clBlue};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.clBlue)};
      text-decoration: underline;
    }
  }
`;

const FlexWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DownloadButton = styled(Button)`
  margin-bottom: 15px;
`;

const Import = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [apiErrors, setApiErrors] = useState<CLErrors | undefined>();

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    try {
      await addIdeaImportFile(fileToAdd.base64);
      setFiles((files) => [...files, fileToAdd]);
    } catch (errors) {
      // const errorMessage = formatMessage(messages.importRequiredFieldError, {
      //   requiredField: 'title',
      // });

      // let errorMessage: string;
      // if (errors?.json?.requiredField) {
      //   errorMessage = formatMessage(messages.importRequiredFieldError, {
      //     requiredField: errors.json.requiredField,
      //   });
      // } else {
      //   errorMessage = formatMessage(messages.importGenericError);
      // }

      // setApiErrors({ file: [ { error: errorMessage } ]})
      setApiErrors(errors?.json);
    }
  };

  const downloadExampleFile = async (event) => {
    event.preventDefault();
    const blob = await requestBlob(
      `${API_PATH}/import_ideas/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <>
      <h1>Import inputs</h1>
      <SectionDescription>
        <p>Import existing inputs from an Excel file.</p>
      </SectionDescription>
      <SectionField>
        <StyledSectionTitle>
          1. Download and fill out the template
        </StyledSectionTitle>
        <SectionDescription>
          <FlexWrapper>
            <DownloadButton
              buttonStyle="secondary"
              icon="download"
              onClick={downloadExampleFile}
            >
              Download template
            </DownloadButton>
          </FlexWrapper>
          <SectionParagraph>
            <span>
              <a
                href="https://support.citizenlab.co/en/articles/1502238-how-to-bulk-import-ideas-and-input-or-locations-into-your-project"
                target="_blank"
                rel="noreferrer"
              >
                Visit the support page
              </a>{' '}
              if you want more info about all supported columns in the import
              template.
            </span>
          </SectionParagraph>
          <SectionParagraph>
            Important: In order to send the invitations correctly, no column can
            be removed from the import template. Leave unused columns empty.
          </SectionParagraph>
        </SectionDescription>

        <StyledSectionTitle>
          2. Upload your completed template file
        </StyledSectionTitle>
        <FileUploader
          id={'bulk_idea_import'}
          onFileRemove={() => {}}
          onFileAdd={handleFileOnAdd}
          apiErrors={apiErrors}
          files={files}
        />
      </SectionField>
    </>
  );
};

export default injectIntl(Import);
