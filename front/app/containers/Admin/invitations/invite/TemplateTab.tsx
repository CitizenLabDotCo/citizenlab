import React, { useRef, ChangeEvent } from 'react';

import {
  fontSizes,
  Text,
  Box,
  Button,
  colors,
} from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { darken } from 'polished';
import styled from 'styled-components';

import { API_PATH } from 'containers/App/constants';

import { SectionField, SectionTitle } from 'components/admin/Section';
import Error from 'components/UI/Error';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from '../messages';

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
  filetypeError: JSX.Element | null;
  handleFileInputOnChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const TemplateTab = ({ filetypeError, handleFileInputOnChange }: Props) => {
  const { formatMessage } = useIntl();
  const fileInputElement = useRef<HTMLInputElement | null>(null);

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

  return (
    <>
      <SectionField>
        <StyledSectionTitle>
          <FormattedMessage {...messages.downloadFillOutTemplate} />
        </StyledSectionTitle>
        <Text fontSize="base">
          <Box display="flex" justifyContent="space-between">
            <DownloadButton
              buttonStyle="secondary-outlined"
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
                    href={formatMessage(messages.invitesSupportPageURL2)}
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

export default TemplateTab;
