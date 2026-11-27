import React, { ReactNode } from 'react';

import { Modal as AriaModal, ModalOverlay } from 'react-aria-components';

import DialogLayout, { DialogAction } from '../Modal/DialogLayout';

import styles from './SidePanel.module.css';
import '../tokens.css';

type SidePanelProps = {
  // What the panel is about, in the grey head line ("Collect ideas").
  title: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // In the head, before the close chevron: the "1 of 124" stepper.
  headActions?: ReactNode;
  primaryAction?: DialogAction;
};

// ModalOverlay + Modal anchored right, not Sheet: we own its speed and curve.
const SidePanel = ({
  title,
  children,
  isOpen,
  onOpenChange,
  headActions,
  primaryAction,
}: SidePanelProps) => (
  <ModalOverlay
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    className={styles.overlay}
  >
    <AriaModal className={styles.panel}>
      <DialogLayout
        title={title}
        bodyClassName={styles.body}
        headActions={headActions}
        // The library's side panel folds away with a chevron.
        closeIcon="chevron-down-16"
        titleClassName={styles.title}
        primaryAction={primaryAction}
      >
        {children}
      </DialogLayout>
    </AriaModal>
  </ModalOverlay>
);

export default SidePanel;
