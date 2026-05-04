import React, { useState } from 'react';

import {
  Box,
  Divider,
  Icon,
  Text,
  Title,
  Button,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormType } from 'components/FormBuilder/utils';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import ExcelImportButton from './components/ExcelImportButton';
import PDFImportButton from './components/PDFImportButton';
import ExcelDownloadButton from './ExcelDownloadButton';
import messages from './messages';
import PDFExportModal from './PDFExportModal';

interface Props {
  formType: FormType;
  onClickPDFImport?: () => void;
  onClickExcelImport?: () => void;
  pdfImportSupported: boolean;
  showTitle?: boolean;
}

const ImportInputsSection = ({
  formType,
  onClickPDFImport,
  onClickExcelImport,
  pdfImportSupported,
  showTitle,
}: Props) => {
  const { formatMessage } = useIntl();
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const printedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  const importerPath = `/admin/projects/${projectId}/phases/${phaseId}/input-importer`;

  return (
    <Box>
      {showTitle && (
        <>
          <Divider mb="28px" />
          <Title
            variant="h5"
            color="coolGrey600"
            fontWeight="semi-bold"
            mb="28px"
          >
            {formatMessage(messages.importResponses).toUpperCase()}
          </Title>
        </>
      )}
      <Box display="flex" flexDirection="column" gap="16px">
        {/* Paper forms OCR card */}
        {pdfImportSupported && (
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
              <PDFImportButton
                printedFormsEnabled={printedFormsEnabled}
                onClickPDFImport={onClickPDFImport}
                importerPath={importerPath}
              />
            </Box>
          </Box>
        )}

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
          </Box>
          <Box flex="1">
            <Text color="coolGrey700" m="0px" fontWeight="bold">
              <FormattedMessage {...messages.spreadsheet} />
            </Text>
            <Text m="0px" mt="4px" color="coolGrey700">
              <FormattedMessage {...messages.spreadsheetDescription} />
            </Text>
          </Box>
          <Box display="flex" alignItems="center" gap="8px">
            <ExcelDownloadButton phaseId={phaseId} />
            <UpsellTooltip disabled={inputImporterAllowed} theme="dark">
              <ExcelImportButton
                onClickExcelImport={onClickExcelImport}
                importerPath={importerPath}
                inputImporterAllowed={inputImporterAllowed}
              />
            </UpsellTooltip>
          </Box>
        </Box>
      </Box>

      {pdfImportSupported && (
        <PDFExportModal
          open={exportModalOpen}
          formType={formType}
          onClose={() => setExportModalOpen(false)}
          phaseId={phaseId}
        />
      )}
    </Box>
  );
};

export default ImportInputsSection;
