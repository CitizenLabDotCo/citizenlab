import React from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import formSyncMessages from 'components/admin/FormSync/messages';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';

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
        <Button
          buttonStyle="text"
          icon="upload-file"
          onClick={onClickExcelImport}
          disabled={!inputImporterAllowed}
        >
          <FormattedMessage {...formSyncMessages.importFile} />
        </Button>
      </UpsellTooltip>
      {pdfImportSupported && (
        <>
          {printedFormsEnabled ? (
            <Button
              buttonStyle="admin-dark"
              icon="form-sync"
              onClick={onClickPDFImport}
            >
              <FormattedMessage {...formSyncMessages.importScans} />
            </Button>
          ) : (
            <Tooltip
              content={
                <Box display="flex" flexDirection="column" gap="8px">
                  <FormattedMessage
                    {...formSyncMessages.unlockScanningTooltip1}
                  />
                  <FormattedMessage
                    {...formSyncMessages.unlockScanningTooltip2}
                  />
                </Box>
              }
              theme="dark"
            >
              <Button buttonStyle="admin-dark" icon="lock" disabled>
                <FormattedMessage {...formSyncMessages.unlockScanning} />
              </Button>
            </Tooltip>
          )}
        </>
      )}
    </Box>
  );
};

export default ImportButtons;
