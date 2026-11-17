import React from 'react';

import { Modal as AriaModal, ModalOverlay } from 'react-aria-components';

import '../tokens.css';

import DialogLayout, { DialogLayoutProps } from './DialogLayout';
import styles from './Modal.module.css';

export { DialogTrigger } from 'react-aria-components';
export type { DialogAction } from './DialogLayout';

export type ModalSize = 440 | 560 | 866 | 920;

export type ModalProps = DialogLayoutProps & {
  size?: ModalSize;
  // Leave these out inside a DialogTrigger, which owns the open state.
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  // Also dismiss it on a press on the backdrop.
  isDismissable?: boolean;
  'data-cy'?: string;
};

// Escape and Close dismiss it; a press on the backdrop only with isDismissable.
const Modal = ({
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  showClose = true,
  size = 560,
  isOpen,
  defaultOpen,
  onOpenChange,
  isDismissable = false,
  'data-cy': dataCy,
}: ModalProps) => (
  <ModalOverlay
    isOpen={isOpen}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    isDismissable={isDismissable}
    className={styles.overlay}
  >
    <AriaModal className={`${styles.modal} ${styles[`size${size}`]}`}>
      <DialogLayout
        title={title}
        description={description}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        showClose={showClose}
        data-cy={dataCy}
      >
        {children}
      </DialogLayout>
    </AriaModal>
  </ModalOverlay>
);

export default Modal;
