import React, { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  DropdownListItem,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const ImportButtons = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);

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
            <DropdownListItem onClick={onClickExcelImport}>
              <FormattedMessage {...messages.importExcelFile} />
            </DropdownListItem>
            <DropdownListItem onClick={onClickPDFImport}>
              <FormattedMessage {...messages.importPDFFile} />
            </DropdownListItem>
          </>
        }
      />
    </Box>
  );
};

export default ImportButtons;
