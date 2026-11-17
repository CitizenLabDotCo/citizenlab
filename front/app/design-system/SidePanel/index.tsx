import React, { ReactNode } from 'react';

import { Modal as AriaModal, ModalOverlay } from 'react-aria-components';

import DialogLayout from '../Modal/DialogLayout';
import '../tokens.css';

import styles from './SidePanel.module.css';

type SidePanelProps = {
  title: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

// ModalOverlay + Modal anchored right, not Sheet: we own its speed and curve.
const SidePanel = ({
  title,
  children,
  isOpen,
  onOpenChange,
}: SidePanelProps) => (
  <ModalOverlay
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    className={styles.overlay}
  >
    <AriaModal className={styles.panel}>
      <DialogLayout title={title} bodyClassName={styles.body}>
        {children}
      </DialogLayout>
    </AriaModal>
  </ModalOverlay>
);

export default SidePanel;
