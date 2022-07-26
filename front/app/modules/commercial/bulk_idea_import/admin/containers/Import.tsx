import React, { useState } from 'react';

import { UploadFile, CLErrors } from 'typings';

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

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleFileOnAdd = async (fileToAdd: UploadFile) => {
    setIsLoading(true);
    try {
      await addIdeaImportFile(fileToAdd.base64);
      setFiles((files) => [...files, fileToAdd]);
      setIsSuccess(true);
    } catch (errors) {
      setApiErrors(errors?.json);
      setIsSuccess(false);
    }
    setIsLoading(false);
  };

  const downloadExampleFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/import_ideas/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  return (
    <>
      <h1>
        <FormattedMessage {...messages.importInputs} />
      </h1>
      <SectionDescription>
        <p>
          <FormattedMessage {...messages.importDescription} />
        </p>
      </SectionDescription>
      <SectionField>
        <StyledSectionTitle>
          <FormattedMessage {...messages.importStepOne} />
        </StyledSectionTitle>
        <SectionDescription>
          <FlexWrapper>
            <DownloadButton
              buttonStyle="secondary"
              icon="download"
              onClick={downloadExampleFile}
            >
              <FormattedMessage {...messages.downloadTemplate} />
            </DownloadButton>
          </FlexWrapper>
          <SectionParagraph>
            <FormattedMessage {...messages.importHint} />
          </SectionParagraph>
        </SectionDescription>

        <StyledSectionTitle>
          <FormattedMessage {...messages.importStepTwo} />
        </StyledSectionTitle>
        <FileUploader
          id={'bulk_idea_import'}
          onFileRemove={() => {}}
          onFileAdd={handleFileOnAdd}
          apiErrors={apiErrors}
          files={files}
        />
        {!isLoading && isSuccess && <div>File upload successful</div>}
      </SectionField>
    </>
  );
};

export default Import;
