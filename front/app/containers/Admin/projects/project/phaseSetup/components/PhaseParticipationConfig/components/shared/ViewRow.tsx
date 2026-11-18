import React, { ReactNode } from 'react';

import Button from 'design-system/Button';
import Icon from 'design-system/Icon';
import Switch from 'design-system/Switch';
import Tooltip from 'design-system/Tooltip';
import UnstyledButton from 'design-system/UnstyledButton';

import messages from 'containers/Admin/projects/project/messages';

import { useIntl } from 'utils/cl-intl';

import styles from './ViewRow.module.css';
import 'design-system/tokens.css';

interface Props {
  title: string;
  description: ReactNode;
  enabled: boolean;
  alwaysEnabled?: boolean;
  isDefault: boolean;
  onToggle: () => void;
  onMakeDefault: () => void;
  /** Extra settings for the view, shown while it is on. */
  children?: ReactNode;
}

const ViewRow = ({
  title,
  description,
  enabled,
  alwaysEnabled,
  isDefault,
  onToggle,
  onMakeDefault,
  children,
}: Props) => {
  const { formatMessage } = useIntl();
  const cannotBeDisabled = formatMessage(messages.listViewCannotBeDisabled);
  const titleText = <span className={styles.title}>{title}</span>;

  return (
    <div className={styles.row}>
      {alwaysEnabled ? (
        <div className={styles.alwaysEnabled}>
          <span className={styles.checkSlot}>
            <Icon name="check-14" className={styles.alwaysEnabledCheck} />
          </span>
          {titleText}
          <Tooltip content={cannotBeDisabled}>
            <UnstyledButton
              className={styles.infoButton}
              aria-label={cannotBeDisabled}
            >
              <Icon name="info-16" />
            </UnstyledButton>
          </Tooltip>
        </div>
      ) : (
        <Switch size={26} isSelected={enabled} onChange={() => onToggle()}>
          {titleText}
        </Switch>
      )}
      <div className={styles.body}>
        <span className={styles.description}>{description}</span>
        {enabled && isDefault && (
          <span className={styles.defaultMark}>
            <Icon name="check-14" />
            {formatMessage(messages.defaultLabel)}
          </span>
        )}
        {enabled && !isDefault && (
          <div>
            <Button variant="quiet" size={28} onPress={onMakeDefault}>
              {formatMessage(messages.makeDefault)}
            </Button>
          </div>
        )}
        {enabled && children}
      </div>
    </div>
  );
};

export default ViewRow;
