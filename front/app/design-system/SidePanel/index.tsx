import React from 'react';

import { Modal as AriaModal, ModalOverlay } from 'react-aria-components';

import DialogLayout, { DialogLayoutProps } from '../Modal/DialogLayout';
import '../tokens.css';

import styles from './SidePanel.module.css';

export type SidePanelProps = DialogLayoutProps & {
  // Leave these out inside a DialogTrigger, which owns the open state.
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  'data-cy'?: string;
};

// ModalOverlay + Modal anchored right, not Sheet: we own its speed and curve.
const SidePanel = ({
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  showClose = true,
  isOpen,
  defaultOpen,
  onOpenChange,
  'data-cy': dataCy,
}: SidePanelProps) => (
  <ModalOverlay
    isOpen={isOpen}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    className={styles.overlay}
  >
    <AriaModal className={styles.panel}>
      <DialogLayout
        title={title}
        description={description}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        showClose={showClose}
        bodyClassName={styles.body}
        data-cy={dataCy}
      >
        {children}
      </DialogLayout>
    </AriaModal>
  </ModalOverlay>
);

export default SidePanel;
