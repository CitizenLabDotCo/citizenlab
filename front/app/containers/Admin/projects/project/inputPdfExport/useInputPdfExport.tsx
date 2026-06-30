import React, { useState } from 'react';

import InputPdfExportModal from './InputPdfExportModal';

type Args = {
  projectId: string;
  phaseId: string;
};

// Shared wiring for the "Export responses to PDF" action: the modal open/close
// state and the modal element itself. Used by every insights view that offers
// the export (native survey, ideation, proposals) so the trigger and the modal
// stay in sync without duplicating the plumbing.
//
// Render `modal` at a level that outlives the trigger (e.g. next to the action
// bar, not inside the dropdown that closes on click), and call `openModal` from
// the dropdown item.
const useInputPdfExport = ({ projectId, phaseId }: Args) => {
  const [opened, setOpened] = useState(false);

  return {
    openModal: () => setOpened(true),
    modal: opened ? (
      <InputPdfExportModal
        projectId={projectId}
        phaseId={phaseId}
        opened
        onClose={() => setOpened(false)}
      />
    ) : null,
  };
};

export default useInputPdfExport;
