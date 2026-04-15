import React, { useState } from 'react';

import {
  Box,
  Icon,
  Text,
  Title,
  Button,
  Tooltip,
  colors,
  stylingConsts,
  Divider,
} from '@citizenlab/cl2-component-library';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PDFExportModal from 'containers/Admin/projects/components/PDFExportModal';
import { API_PATH } from 'containers/App/constants';

import { FormType } from 'components/FormBuilder/utils';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';

interface Props {
  formType: FormType;
}

const ImportResponsesSection = ({ formType }: Props) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { formatMessage } = useIntl();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const printedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  const downloadExampleXlsxFile = async () => {
    const blob = await requestBlob(
      `${API_PATH}/phases/${phaseId}/importer/export_form/idea/xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    saveAs(blob, 'example.xlsx');
  };

  const importerPath = `/admin/projects/${projectId}/phases/${phaseId}/input-importer`;

  return (
    <Box mt="28px">
      <Divider mb="28px" />
      <Title variant="h5" color="coolGrey600" fontWeight="semi-bold" mb="28px">
        {formatMessage(messages.importResponses).toUpperCase()}
      </Title>
      <Box display="flex" flexDirection="column" gap="16px">
        {/* Paper forms OCR card */}
        <Box
          display="flex"
          alignItems="center"
          gap="16px"
          p="12px"
          borderRadius={stylingConsts.borderRadius}
          border={`1px solid ${colors.grey300}`}
          background={colors.white}
        >
          <Box
            background={colors.blue10}
            p="8px"
            borderRadius={stylingConsts.borderRadius}
          >
            <Icon name="form-sync" fill={colors.blue500} width="20px" />
          </Box>
          <Box flex="1">
            <Text color="coolGrey700" m="0px" fontWeight="bold">
              <FormattedMessage {...messages.paperFormsOCR} />
            </Text>
            <Text m="0px" mt="4px" color="coolGrey700">
              <FormattedMessage {...messages.paperFormsOCRDescription} />
            </Text>
          </Box>
          <Box display="flex" alignItems="center" gap="8px">
            <Button
              icon="download"
              onClick={() => setExportModalOpen(true)}
              buttonStyle="text"
            >
              <FormattedMessage {...messages.downloadPDF} />
            </Button>
            {printedFormsEnabled ? (
              <ButtonWithLink
                buttonStyle="admin-dark"
                icon="form-sync"
                linkTo={importerPath}
              >
                <FormattedMessage {...messages.importScans} />
              </ButtonWithLink>
            ) : (
              <Tooltip
                content={
                  <Box display="flex" flexDirection="column" gap="8px">
                    <FormattedMessage {...messages.unlockScanningTooltip1} />
                    <FormattedMessage {...messages.unlockScanningTooltip2} />
                  </Box>
                }
                theme="dark"
              >
                {/* Empty button used to match designs, as this is admin-only it is fine */}
                <Button buttonStyle="admin-dark" icon="lock">
                  <FormattedMessage {...messages.unlockScanning} />
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Spreadsheet card */}
        <Box
          display="flex"
          alignItems="center"
          gap="16px"
          p="12px"
          borderRadius={stylingConsts.borderRadius}
          border={`1px solid ${colors.grey300}`}
          background={colors.grey50}
        >
          <Box
            background={colors.grey200}
            p="8px"
            borderRadius={stylingConsts.borderRadius}
          >
            <Icon name="survey-matrix" fill={colors.grey700} width="20px" />
          </Box>{' '}
          <Box flex="1">
            <Text color="coolGrey700" m="0px" fontWeight="bold">
              <FormattedMessage {...messages.spreadsheet} />
            </Text>
            <Text m="0px" mt="4px" color="coolGrey700">
              <FormattedMessage {...messages.spreadsheetDescription} />
            </Text>
          </Box>
          <Box display="flex" alignItems="center" gap="8px">
            <Button
              buttonStyle="text"
              icon="download"
              onClick={downloadExampleXlsxFile}
            >
              <FormattedMessage {...messages.template} />
            </Button>
            <ButtonWithLink
              buttonStyle="text"
              icon="upload-file"
              linkTo={importerPath}
            >
              <FormattedMessage {...messages.importFile} />
            </ButtonWithLink>
          </Box>
        </Box>
      </Box>

      <PDFExportModal
        open={exportModalOpen}
        formType={formType}
        onClose={() => setExportModalOpen(false)}
        phaseId={phaseId}
      />
    </Box>
  );
};

export default ImportResponsesSection;
