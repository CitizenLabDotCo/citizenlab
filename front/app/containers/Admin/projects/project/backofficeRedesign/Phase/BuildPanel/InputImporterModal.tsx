import React, { useState } from 'react';

import {
  Box,
  Button,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import ImportExcelModal from 'containers/Admin/projects/project/inputImporter/ImportModal/ImportExcelModal';
import ImportPdfModal from 'containers/Admin/projects/project/inputImporter/ImportModal/ImportPdfModal';
import inputImporterMessages from 'containers/Admin/projects/project/inputImporter/messages';

import formSyncMessages from 'components/admin/FormSync/messages';
import Modal from 'components/UI/Modal';
import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';

import ImporterRow from './ImporterRow';

interface Props {
  projectId: string;
  phaseId: string;
  opened: boolean;
  onClose: () => void;
}

const InputImporterModal = ({ projectId, phaseId, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const printedFormsEnabled = useFeatureFlag({ name: 'import_printed_forms' });
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  const [upload, setUpload] = useState<'pdf' | 'excel' | null>(null);

  // The upload replaces this modal.
  const importButton = (
    label: string,
    format: 'pdf' | 'excel',
    disabled: boolean
  ) => (
    <Button
      buttonStyle="bo-secondary"
      boSize="medium"
      width="auto"
      disabled={disabled}
      onClick={() => {
        onClose();
        setUpload(format);
      }}
    >
      {label}
    </Button>
  );

  // Imported inputs wait for review on the importer page.
  const goToReview = () =>
    clHistory.push(
      `/admin/projects/${projectId}/phases/${phaseId}/input-importer`
    );

  return (
    <>
      <Modal
        opened={opened}
        close={onClose}
        width={560}
        variant="bo"
        header={formatMessage(inputImporterMessages.inputImporter)}
      >
        <Box p="24px" display="flex" flexDirection="column" gap="16px">
          <ImporterRow
            title={formatMessage(messages.paperForms)}
            description={formatMessage(messages.paperFormsDescription)}
          >
            <Tooltip
              disabled={printedFormsEnabled}
              theme="dark"
              content={
                <Box display="flex" flexDirection="column" gap="8px">
                  {formatMessage(formSyncMessages.unlockScanningTooltip1)}
                  {formatMessage(formSyncMessages.unlockScanningTooltip2)}
                </Box>
              }
            >
              {importButton(
                formatMessage(formSyncMessages.importScans),
                'pdf',
                !printedFormsEnabled
              )}
            </Tooltip>
          </ImporterRow>
          <Box borderTop={`1px solid ${colors.grey200}`} />
          <ImporterRow
            title={formatMessage(formSyncMessages.spreadsheet)}
            description={formatMessage(messages.spreadsheetImportDescription)}
          >
            <UpsellTooltip disabled={inputImporterAllowed} theme="dark">
              {importButton(
                formatMessage(formSyncMessages.importFile),
                'excel',
                !inputImporterAllowed
              )}
            </UpsellTooltip>
          </ImporterRow>
        </Box>
      </Modal>
      <ImportPdfModal
        open={upload === 'pdf'}
        onClose={() => setUpload(null)}
        onUploaded={goToReview}
      />
      <ImportExcelModal
        projectId={projectId}
        phaseId={phaseId}
        open={upload === 'excel'}
        onClose={() => setUpload(null)}
        onUploaded={goToReview}
      />
    </>
  );
};

export default InputImporterModal;
