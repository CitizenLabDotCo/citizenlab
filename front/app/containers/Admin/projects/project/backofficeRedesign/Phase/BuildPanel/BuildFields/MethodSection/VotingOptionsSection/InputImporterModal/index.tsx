import React, { useState } from 'react';

import {
  Box,
  Button,
  Divider,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import inputImporterMessages from 'containers/Admin/projects/project/inputImporter/messages';

import formSyncMessages from 'components/admin/FormSync/messages';
import ImportExcelModal from 'components/admin/InputImporterModals/ImportExcelModal';
import ImportPdfModal from 'components/admin/InputImporterModals/ImportPdfModal';
import Modal, { MEDIUM_MODAL_WIDTH } from 'components/UI/Modal';
import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import ImporterRow from './ImporterRow';
import messages from './messages';

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
  const startUpload = (format: 'pdf' | 'excel') => {
    onClose();
    setUpload(format);
  };

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
        width={MEDIUM_MODAL_WIDTH}
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
              <Button
                buttonStyle="bo-secondary"
                boSize="medium"
                width="auto"
                disabled={!printedFormsEnabled}
                onClick={() => startUpload('pdf')}
              >
                {formatMessage(formSyncMessages.importScans)}
              </Button>
            </Tooltip>
          </ImporterRow>
          <Divider margin="0" />
          <ImporterRow
            title={formatMessage(formSyncMessages.spreadsheet)}
            description={formatMessage(messages.spreadsheetImportDescription)}
          >
            <UpsellTooltip disabled={inputImporterAllowed} theme="dark">
              <Button
                buttonStyle="bo-secondary"
                boSize="medium"
                width="auto"
                disabled={!inputImporterAllowed}
                onClick={() => startUpload('excel')}
              >
                {formatMessage(formSyncMessages.importFile)}
              </Button>
            </UpsellTooltip>
          </ImporterRow>
        </Box>
      </Modal>
      <ImportPdfModal
        projectId={projectId}
        phaseId={phaseId}
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
