import React, { ReactNode } from 'react';

import {
  Dialog,
  Heading,
  Modal as AriaModal,
  ModalOverlay,
} from 'react-aria-components';

import Button from '../Button';
import Icon from '../Icon';
import modalStyles from '../Modal/Modal.module.css';

import styles from './AnnouncementModal.module.css';
import '../tokens.css';

type Action = {
  label: ReactNode;
  onPress: () => void;
  isPending?: boolean;
};

type Props = {
  isOpen: boolean;
  // A picture or animation of what is announced, 504 × 316.
  media: ReactNode;
  title: ReactNode;
  // What it brings, one short line each.
  points: ReactNode[];
  // Taking it up.
  primaryAction: Action;
  // Putting it off. Escape does the same.
  secondaryAction: Action;
  // A short line under the buttons, e.g. how to undo the choice.
  note?: ReactNode;
  error?: ReactNode;
};

// Introduces something new and asks the user to take it up now or later.
const AnnouncementModal = ({
  isOpen,
  media,
  title,
  points,
  primaryAction,
  secondaryAction,
  note,
  error,
}: Props) => (
  <ModalOverlay
    isOpen={isOpen}
    onOpenChange={(open) => {
      if (!open) secondaryAction.onPress();
    }}
    isKeyboardDismissDisabled={primaryAction.isPending}
    className={modalStyles.overlay}
  >
    <AriaModal className={`${modalStyles.modal} ${styles.modal}`}>
      <Dialog className={styles.dialog}>
        <div className={styles.media}>{media}</div>
        <div className={styles.body}>
          <Heading slot="title" className={styles.title}>
            {title}
          </Heading>
          <ul className={styles.points}>
            {points.map((point, index) => (
              <li key={index} className={styles.point}>
                <span className={styles.check}>
                  <Icon name="check-14" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              fullWidth
              onPress={secondaryAction.onPress}
              isDisabled={primaryAction.isPending}
            >
              {secondaryAction.label}
            </Button>
            <Button
              variant="primary"
              fullWidth
              onPress={primaryAction.onPress}
              isPending={primaryAction.isPending}
            >
              {primaryAction.label}
            </Button>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {note && <p className={styles.note}>{note}</p>}
        </div>
      </Dialog>
    </AriaModal>
  </ModalOverlay>
);

export default AnnouncementModal;
