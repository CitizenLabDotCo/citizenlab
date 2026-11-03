import React, { useState } from 'react';

import InputPdfExportModal from './InputPdfExportModal';
import InputXlsxExportModal from './InputXlsxExportModal';

type Args = {
  projectId: string;
  phaseId: string;
};

// Shared wiring for the "Export responses" actions (PDF and Excel): the modal
// open/close state and the modal element itself. Used by every insights view
// that offers the exports (native survey, ideation, proposals) so the triggers
// and the modal stay in sync without duplicating the plumbing.
//
// Render `modal` at a level that outlives the trigger (e.g. next to the action
// bar, not inside the dropdown that closes on click), and call the open
// functions from the dropdown items.
const useInputResponseExport = ({ projectId, phaseId }: Args) => {
  const [openedModal, setOpenedModal] = useState<'pdf' | 'xlsx' | null>(null);

  const close = () => setOpenedModal(null);

  return {
    openPdfExportModal: () => setOpenedModal('pdf'),
    openXlsxExportModal: () => setOpenedModal('xlsx'),
    modal:
      openedModal === 'pdf' ? (
        <InputPdfExportModal
          projectId={projectId}
          phaseId={phaseId}
          opened
          onClose={close}
        />
      ) : openedModal === 'xlsx' ? (
        <InputXlsxExportModal phaseId={phaseId} opened onClose={close} />
      ) : null,
  };
};

export default useInputResponseExport;
