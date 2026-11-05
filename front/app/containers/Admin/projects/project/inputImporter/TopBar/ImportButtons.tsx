import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ExcelImportButton from 'components/admin/FormSync/components/ExcelImportButton';
import PDFImportButton from 'components/admin/FormSync/components/PDFImportButton';
import UpsellTooltip from 'components/UpsellTooltip';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
  pdfImportSupported: boolean;
}

const ImportButtons = ({
  onClickPDFImport,
  onClickExcelImport,
  pdfImportSupported,
}: Props) => {
  const printedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  return (
    <Box display="flex" gap="8px">
      <UpsellTooltip disabled={inputImporterAllowed} theme="dark">
        <ExcelImportButton
          onClickExcelImport={onClickExcelImport}
          inputImporterAllowed={inputImporterAllowed}
        />
      </UpsellTooltip>
      {pdfImportSupported && (
        <PDFImportButton
          printedFormsEnabled={printedFormsEnabled}
          onClickPDFImport={onClickPDFImport}
        />
      )}
    </Box>
  );
};

export default ImportButtons;
