import React from 'react';

import { Modal as AriaModal, ModalOverlay } from 'react-aria-components';

import DialogLayout, { DialogLayoutProps } from './DialogLayout';
import styles from './Modal.module.css';
import '../tokens.css';

export type { DialogAction } from './DialogLayout';

type ModalProps = DialogLayoutProps & {
  size?: 440 | 560 | 866 | 920;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
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
  leadingAction,
  showClose = true,
  isCloseDisabled,
  size = 560,
  isOpen,
  onOpenChange,
  isDismissable = false,
  'data-cy': dataCy,
}: ModalProps) => (
  <ModalOverlay
    isOpen={isOpen}
    onOpenChange={onOpenChange}
    isDismissable={isDismissable && !isCloseDisabled}
    isKeyboardDismissDisabled={isCloseDisabled}
    className={styles.overlay}
  >
    <AriaModal className={`${styles.modal} ${styles[`size${size}`]}`}>
      <DialogLayout
        title={title}
        description={description}
        primaryAction={primaryAction}
        secondaryAction={secondaryAction}
        leadingAction={leadingAction}
        showClose={showClose}
        isCloseDisabled={isCloseDisabled}
        data-cy={dataCy}
      >
        {children}
      </DialogLayout>
    </AriaModal>
  </ModalOverlay>
);

export default Modal;
