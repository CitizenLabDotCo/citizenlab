import React, { useState } from 'react';

import {
  colors,
  Icon,
  DropdownListItem,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import PDFExportModal, {
  FormPDFExportFormValues,
} from 'containers/Admin/projects/components/PDFExportModal';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  onExport: (formValues: FormPDFExportFormValues) => Promise<void>;
}

const DownloadPDFDropdownListItemWithModal = ({ onExport }: Props) => {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const importPrintedFormsAllowed = useFeatureFlag({
    name: 'import_printed_forms',
    onlyCheckAllowed: true,
  });
  const { formatMessage } = useIntl();

  return (
    <>
      <UpsellTooltip
        disabled={importPrintedFormsAllowed}
        // Needed to ensure DropdownListItem takes up the full width of the dropdown
        width="100%"
      >
        <DropdownListItem
          onClick={() => setExportModalOpen(true)}
          disabled={!importPrintedFormsAllowed}
        >
          <Icon name="download" fill={colors.coolGrey600} mr="4px" />
          {formatMessage(messages.downloadSurvey)}
        </DropdownListItem>
      </UpsellTooltip>
      <PDFExportModal
        open={exportModalOpen}
        formType="survey"
        onClose={() => setExportModalOpen(false)}
        onExport={onExport}
      />
    </>
  );
};

export default DownloadPDFDropdownListItemWithModal;
