import React, { ReactNode } from 'react';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';

import messages from './messages';
import styles from './TooltipMark.module.css';
import TooltipTarget from './TooltipTarget';

import Tooltip from './index';

type Props = {
  label?: string;
  content?: ReactNode;
  children?: ReactNode;
  className?: string;
  size?: 24;
};

const TooltipMark = ({ label, content, children, className, size }: Props) => {
  const { formatMessage } = useIntl();
  const accessibleLabel = label ?? formatMessage(messages.moreInformation);

  return (
    <Tooltip content={content ?? accessibleLabel}>
      <TooltipTarget
        className={`${styles.mark} ${size === 24 ? styles.size24 : ''} ${
          className ?? ''
        }`}
        aria-label={accessibleLabel}
      >
        {children ?? <Icon name="info-16" className={styles.info} />}
      </TooltipTarget>
    </Tooltip>
  );
};

export default TooltipMark;
