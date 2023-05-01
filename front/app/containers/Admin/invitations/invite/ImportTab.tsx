import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { SectionField, SectionTitle } from 'components/admin/Section';
// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import {
  fontSizes,
  Text,
  Box,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import Error from 'components/UI/Error';
import { saveAs } from 'file-saver';
import { requestBlob } from 'utils/request';
import { API_PATH } from 'containers/App/constants';
import { getBase64FromFile } from 'utils/fileUtils';

const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 15px;
  font-size: ${fontSizes.l}px;
  font-weight: bold;
`;

const DownloadButton = styled(Button)`
  margin-bottom: 15px;
`;

const SectionParagraph = styled.p`
  a {
    color: ${colors.teal};
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.teal)};
      text-decoration: underline;
    }
  }
`;

interface Props {
  resetErrorAndSuccessState: () => void;
}

const ImportTab = ({ resetErrorAndSuccessState }: Props) => {
  const { formatMessage } = useIntl();
  const fileInputElement = useRef<HTMLInputElement | null>(null);
  const [filetypeError, setFiletypeError] = useState<JSX.Element | null>(null);
  const [selectedFileBase64, setSelectedFileBase64] = useState<string | null>(
    null
  );
  const downloadExampleFile = async (
    event: React.MouseEvent<Element, MouseEvent>
  ) => {
    event.preventDefault();
    const blob = await requestBlob(
      `${API_PATH}/invites/example_xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  const handleFileInputOnChange = async (event) => {
    let selectedFile: File | null =
      event.target.files && event.target.files.length === 1
        ? event.target.files['0']
        : null;
    let filetypeError: JSX.Element | null = null;

    if (
      selectedFile &&
      selectedFile.type !==
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      filetypeError = <FormattedMessage {...messages.filetypeError} />;
      selectedFile = null;

      if (fileInputElement.current) {
        fileInputElement.current.value = '';
      }
    }

    const selectedFileBase64 = selectedFile
      ? await getBase64FromFile(selectedFile)
      : null;
    resetErrorAndSuccessState();
    setSelectedFileBase64(selectedFileBase64);
    setFiletypeError(filetypeError);
  };

  return (
    <>
      <SectionField>
        <StyledSectionTitle>
          <FormattedMessage {...messages.downloadFillOutTemplate} />
        </StyledSectionTitle>
        <Text fontSize="base">
          <Box display="flex" justifyContent="space-between">
            <DownloadButton
              buttonStyle="secondary"
              icon="download"
              onClick={downloadExampleFile}
            >
              <FormattedMessage {...messages.downloadTemplate} />
            </DownloadButton>
          </Box>
          <SectionParagraph>
            <FormattedMessage
              {...messages.visitSupportPage}
              values={{
                supportPageLink: (
                  <a
                    href={formatMessage(messages.invitesSupportPageURL)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage {...messages.supportPageLinkText} />
                  </a>
                ),
              }}
            />
          </SectionParagraph>
          <SectionParagraph>
            <FormattedMessage {...messages.fileRequirements} />
          </SectionParagraph>
        </Text>

        <StyledSectionTitle>
          <FormattedMessage {...messages.uploadCompletedFile} />
        </StyledSectionTitle>

        <Box marginBottom="20px" marginTop="15px">
          <input
            type="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileInputOnChange}
            ref={fileInputElement}
          />
        </Box>
        <Error text={filetypeError} />
      </SectionField>

      <StyledSectionTitle>
        <FormattedMessage {...messages.configureInvitations} />
      </StyledSectionTitle>
    </>
  );
};

export default ImportTab;
