import React, { useState } from 'react';

import {
  Badge,
  Box,
  Button,
  Dropdown,
  DropdownListItem,
  TooltipContentWrapper,
  colors,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const ImportButtons = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);
  const importPrintedFormsEnabled = useFeatureFlag({
    name: 'import_printed_forms',
  });

  return (
    <Box>
      <Button
        buttonStyle="admin-dark-text"
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
            <DropdownListItem
              onClick={importPrintedFormsEnabled ? onClickPDFImport : undefined}
            >
              <Tippy
                interactive={true}
                theme={''}
                maxWidth={350}
                content={
                  <TooltipContentWrapper tippytheme="light">
                    <FormattedMessage {...messages.disabledPDFImportTooltip} />
                  </TooltipContentWrapper>
                }
              >
                <Box
                  display="flex"
                  style={
                    importPrintedFormsEnabled ? {} : { cursor: 'not-allowed' }
                  }
                >
                  <Box mr="12px" alignSelf="center">
                    <FormattedMessage {...messages.importPDFFile} />
                  </Box>
                  <Box alignSelf="center">
                    <Badge color={colors.teal400}>
                      <FormattedMessage {...messages.premium} />
                    </Badge>
                  </Box>
                </Box>
              </Tippy>
            </DropdownListItem>
          </>
        }
      />
    </Box>
  );
};

export default ImportButtons;
