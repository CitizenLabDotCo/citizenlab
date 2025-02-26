import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  DropdownListItem,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const ImportButtons = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const printedFormsAllowed = useFeatureFlag({
    name: 'import_printed_forms',
    onlyCheckAllowed: true,
  });
  const inputImporterAllowed = useFeatureFlag({
    name: 'input_importer',
    onlyCheckAllowed: true,
  });

  return (
    <Box>
      <Button
        buttonStyle="secondary-outlined"
        onClick={() => setDropdownOpened((opened) => !opened)}
        icon="page"
      >
        <FormattedMessage {...messages.importFile} />
      </Button>
      <Dropdown
        width="100%"
        right="25px"
        opened={dropdownOpened}
        onClickOutside={() => setDropdownOpened(false)}
        content={
          <>
            <UpsellTooltip
              disabled={inputImporterAllowed}
              // Needed to ensure DropdownListItem takes up the full width of the dropdown
              width="100%"
            >
              <DropdownListItem
                onClick={onClickExcelImport}
                disabled={!inputImporterAllowed}
              >
                <FormattedMessage {...messages.importExcelFile} />
              </DropdownListItem>
            </UpsellTooltip>
            <UpsellTooltip
              disabled={printedFormsAllowed}
              // Needed to ensure DropdownListItem takes up the full width of the dropdown
              width="100%"
            >
              <DropdownListItem
                onClick={onClickPDFImport}
                disabled={!printedFormsAllowed}
              >
                <FormattedMessage {...messages.importPDFFile} />
              </DropdownListItem>
            </UpsellTooltip>
          </>
        }
      />
    </Box>
  );
};

export default ImportButtons;
