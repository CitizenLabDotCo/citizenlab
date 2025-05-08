import React, { useState } from 'react';

import { Button, ButtonProps } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PDFExportModal from 'containers/Admin/projects/components/PDFExportModal';

import { FormType } from 'components/FormBuilder/utils';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props extends ButtonProps {
  formType: FormType;
  phaseId: string;
}

const DownloadPDFButtonWithModal = ({
  formType,
  phaseId,
  ...buttonProps
}: Props) => {
  const importPrintedFormsAllowed = useFeatureFlag({
    name: 'import_printed_forms',
    onlyCheckAllowed: true,
  });
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <>
      <UpsellTooltip disabled={importPrintedFormsAllowed}>
        <Button
          buttonStyle="secondary-outlined"
          icon="download"
          onClick={() => setExportModalOpen(true)}
          disabled={!importPrintedFormsAllowed}
          {...buttonProps}
        >
          <FormattedMessage {...messages.downloadPDF} />
        </Button>
      </UpsellTooltip>
      <PDFExportModal
        open={exportModalOpen}
        formType={formType}
        onClose={() => setExportModalOpen(false)}
        phaseId={phaseId}
      />
    </>
  );
};

export default DownloadPDFButtonWithModal;
