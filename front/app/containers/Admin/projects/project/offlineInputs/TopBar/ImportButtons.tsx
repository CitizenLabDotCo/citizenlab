import React, { useState } from 'react';

import { Button, Dropdown } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

// copied from front/app/components/admin/PostManager/components/ExportMenu/index.tsx
const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const ImportButtons = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);

  return (
    <Container>
      <Button
        buttonStyle="admin-dark-text"
        onClick={() => setDropdownOpened((opened) => !opened)}
        icon="page"
      >
        <FormattedMessage {...messages.importFile} />
      </Button>

      <Dropdown
        width="100%"
        top="50px"
        right="0px"
        mobileRight="0px"
        opened={dropdownOpened}
        onClickOutside={() => setDropdownOpened(false)}
        content={
          <ButtonsContainer>
            <Button buttonStyle="text" onClick={onClickPDFImport}>
              <FormattedMessage {...messages.importPDFFile} />
            </Button>
            <Button buttonStyle="text" onClick={onClickExcelImport}>
              <FormattedMessage {...messages.importExcelFile} />
            </Button>
          </ButtonsContainer>
        }
      />
    </Container>
  );
};

export default ImportButtons;
