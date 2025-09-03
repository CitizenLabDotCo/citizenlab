import React, { useState } from 'react';

import { Button, ButtonProps } from '@citizenlab/cl2-component-library';

import PDFExportModal from 'containers/Admin/projects/components/PDFExportModal';

import { FormType } from 'components/FormBuilder/utils';

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
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <>
      <Button
        buttonStyle="secondary-outlined"
        icon="download"
        onClick={() => setExportModalOpen(true)}
        {...buttonProps}
      >
        <FormattedMessage {...messages.downloadPDF} />
      </Button>
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
