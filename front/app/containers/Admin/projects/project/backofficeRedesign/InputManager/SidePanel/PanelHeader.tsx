import React from 'react';

import IconButton from 'design-system/IconButton';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import styles from './SidePanel.module.css';

export interface PanelNavigation {
  position: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

interface Props {
  navigation: PanelNavigation;
}

// The panel's head holds the context and the close button, so the stepper sits on top of the body.
const PanelHeader = ({ navigation }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <div className={styles.navigation}>
      <IconButton
        icon="chevron-left-16"
        aria-label={formatMessage(messages.previousInput)}
        onPress={() => navigation.onPrevious?.()}
        isDisabled={!navigation.onPrevious}
      />
      <span className={styles.position}>
        {formatMessage(messages.position, {
          position: navigation.position,
          total: navigation.total,
        })}
      </span>
      <IconButton
        icon="chevron-right-16"
        aria-label={formatMessage(messages.nextInput)}
        onPress={() => navigation.onNext?.()}
        isDisabled={!navigation.onNext}
      />
    </div>
  );
};

export default PanelHeader;
