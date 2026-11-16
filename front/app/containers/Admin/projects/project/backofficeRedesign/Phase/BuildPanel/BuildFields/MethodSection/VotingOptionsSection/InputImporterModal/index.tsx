import React, { useState } from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import inputImporterMessages from 'containers/Admin/projects/project/inputImporter/messages';

import formSyncMessages from 'components/admin/FormSync/messages';
import ImportExcelModal from 'components/admin/InputImporterModals/ImportExcelModal';
import ImportPdfModal from 'components/admin/InputImporterModals/ImportPdfModal';
import upsellMessages from 'components/UpsellTooltip/messages';

import Button from 'design-system/Button';
import Divider from 'design-system/Divider';
import Modal from 'design-system/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import styles from './InputImporterModal.module.css';
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
        isOpen={opened}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
        size={560}
        title={formatMessage(inputImporterMessages.inputImporter)}
      >
        <div className={styles.body}>
          <ImporterRow
            title={formatMessage(messages.paperForms)}
            description={formatMessage(messages.paperFormsDescription)}
          >
            <Button
              variant="secondary"
              size={32}
              disabledReason={
                !printedFormsEnabled && (
                  <span className={styles.tooltipLines}>
                    <span>
                      {formatMessage(formSyncMessages.unlockScanningTooltip1)}
                    </span>
                    <span>
                      {formatMessage(formSyncMessages.unlockScanningTooltip2)}
                    </span>
                  </span>
                )
              }
              onPress={() => startUpload('pdf')}
            >
              {formatMessage(formSyncMessages.importScans)}
            </Button>
          </ImporterRow>
          <Divider />
          <ImporterRow
            title={formatMessage(formSyncMessages.spreadsheet)}
            description={formatMessage(messages.spreadsheetImportDescription)}
          >
            <Button
              variant="secondary"
              size={32}
              disabledReason={
                !inputImporterAllowed &&
                formatMessage(upsellMessages.tooltipContent)
              }
              onPress={() => startUpload('excel')}
            >
              {formatMessage(formSyncMessages.importFile)}
            </Button>
          </ImporterRow>
        </div>
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
