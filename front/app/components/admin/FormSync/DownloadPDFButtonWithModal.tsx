import React, { useState } from 'react';

import {
  Box,
  Button,
  ButtonProps,
  Dropdown,
  DropdownListItem,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { FormType } from 'components/FormBuilder/utils';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import PDFExportModal from './PDFExportModal';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { projectId } = useParams() as { projectId: string };

  const importerPath = `/admin/projects/${projectId}/phases/${phaseId}/input-importer`;

  return (
    <Box position="relative">
      <Button
        buttonStyle="secondary-outlined"
        icon="form-sync"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        {...buttonProps}
      >
        <FormattedMessage {...messages.paperForm} />
      </Button>
      <Dropdown
        opened={dropdownOpen}
        onClickOutside={() => setDropdownOpen(false)}
        width="220px"
        top="48px"
        right="0px"
        content={
          <>
            <DropdownListItem
              onClick={() => {
                setDropdownOpen(false);
                setExportModalOpen(true);
              }}
            >
              <Icon name="download" fill={colors.coolGrey600} mr="8px" />
              <Text my="0px">
                <FormattedMessage {...messages.downloadPDF} />
              </Text>
            </DropdownListItem>
            <DropdownListItem
              onClick={() => {
                setDropdownOpen(false);
                window.open(importerPath, '_blank');
              }}
            >
              <Icon name="upload-file" fill={colors.coolGrey600} mr="8px" />
              <Text my="0px">
                <FormattedMessage {...messages.importInputs} />
              </Text>
            </DropdownListItem>
          </>
        }
      />
      <PDFExportModal
        open={exportModalOpen}
        formType={formType}
        onClose={() => setExportModalOpen(false)}
        phaseId={phaseId}
      />
    </Box>
  );
};

export default DownloadPDFButtonWithModal;
