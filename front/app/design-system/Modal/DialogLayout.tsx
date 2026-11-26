import React, { ReactNode, useId } from 'react';

import { Dialog, Heading } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Button from '../Button';
import IconButton from '../IconButton';

import messages from './messages';
import styles from './Modal.module.css';
import '../tokens.css';

export type DialogAction = {
  label: ReactNode;
  // Gets close so an uncontrolled dialog can shut itself when it is done.
  // Without onPress the secondary action just closes.
  onPress?: (close: () => void) => void;
  isPending?: boolean;
  isDisabled?: boolean;
  type?: 'submit';
  form?: string;
  id?: string;
  'data-cy'?: string;
};

export type DialogLayoutProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  primaryAction?: DialogAction;
  secondaryAction?: DialogAction;
  leadingAction?: ReactNode;
  showClose?: boolean;
  isCloseDisabled?: boolean;
};

type Props = DialogLayoutProps & {
  role?: 'dialog' | 'alertdialog';
  // Danger only in an Alert dialog.
  primaryVariant?: 'primary' | 'danger';
  autoFocusSecondary?: boolean;
  bodyClassName?: string;
  'data-cy'?: string;
};

// Head, body and footer shared by Modal, Alert dialog and Side panel.
const DialogLayout = ({
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  leadingAction,
  showClose = true,
  isCloseDisabled,
  role = 'dialog',
  primaryVariant = 'primary',
  autoFocusSecondary = false,
  bodyClassName,
  'data-cy': dataCy,
}: Props) => {
  const { formatMessage } = useIntl();
  const descriptionId = useId();

  return (
    <Dialog
      role={role}
      className={styles.dialog}
      aria-describedby={description ? descriptionId : undefined}
      data-cy={dataCy}
    >
      {({ close }) => (
        <>
          <div className={styles.head}>
            <div className={styles.heading}>
              <Heading slot="title" className={styles.title}>
                {title}
              </Heading>
              {description && (
                <p id={descriptionId} className={styles.description}>
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <IconButton
                icon="x-16"
                aria-label={formatMessage(messages.close)}
                onPress={close}
                isDisabled={isCloseDisabled}
                data-cy="e2e-modal-close-button"
              />
            )}
          </div>
          <div className={`${styles.body} ${bodyClassName ?? ''}`}>
            {children}
          </div>
          {(leadingAction || primaryAction || secondaryAction) && (
            <div className={styles.footer}>
              {leadingAction && (
                <div className={styles.leadingAction}>{leadingAction}</div>
              )}
              {secondaryAction && (
                <Button
                  variant="secondary"
                  size={32}
                  onPress={() =>
                    secondaryAction.onPress
                      ? secondaryAction.onPress(close)
                      : close()
                  }
                  isPending={secondaryAction.isPending}
                  isDisabled={secondaryAction.isDisabled}
                  type={secondaryAction.type}
                  form={secondaryAction.form}
                  id={secondaryAction.id}
                  data-cy={secondaryAction['data-cy']}
                  autoFocus={autoFocusSecondary}
                >
                  {secondaryAction.label}
                </Button>
              )}
              {primaryAction && (
                <Button
                  variant={primaryVariant}
                  size={32}
                  onPress={() => primaryAction.onPress?.(close)}
                  isPending={primaryAction.isPending}
                  isDisabled={primaryAction.isDisabled}
                  type={primaryAction.type}
                  form={primaryAction.form}
                  id={primaryAction.id}
                  data-cy={primaryAction['data-cy']}
                >
                  {primaryAction.label}
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </Dialog>
  );
};

export default DialogLayout;
