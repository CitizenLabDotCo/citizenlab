import React, { ReactNode, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import PanelRow from './PanelRow';

interface Props {
  label: string;
  width?: string;
  children: ReactNode;
}

/** A settings panel row whose surface is a modal. */
const PanelRowModal = ({ label, width, children }: Props) => {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <PanelRow label={label} onClick={() => setOpened(true)} />
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
