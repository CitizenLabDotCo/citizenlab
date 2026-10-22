import React, { ReactNode, useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import SetupCard from 'containers/Admin/projects/project/backofficeRedesign/Event/SetupCard';

import Modal from 'components/UI/Modal';

interface Props {
  label: string;
  width?: string;
  children: ReactNode;
}

const PanelRowModal = ({ label, width, children }: Props) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Box mb="12px">
        <SetupCard
          title={label}
          action={
            <Button
              buttonStyle="bo-text"
              icon="chevron-right"
              iconSize="16px"
              width="28px"
              height="28px"
              padding="0"
              ariaLabel={label}
              onClick={() => setOpened(true)}
            />
          }
        />
      </Box>
      <Modal
        opened={opened}
        close={() => setOpened(false)}
        header={label}
        width={width}
      >
        <Box p="24px">{children}</Box>
      </Modal>
    </>
  );
};

export default PanelRowModal;
