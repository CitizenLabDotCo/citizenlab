import React from 'react';

import IconButton from 'design-system/IconButton';
import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import useInputTermLabels from '../useInputTermLabels';

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

// The "1 of 124" stepper in the panel's head, before the close chevron.
const PanelHeader = ({ navigation }: Props) => {
  const { formatMessage } = useIntl();
  const { term } = useInputTermLabels();

  return (
    <div className={styles.navigation}>
      <IconButton
        icon="chevron-left-16"
        size={24}
        aria-label={formatMessage(messages.previousTerm, { term })}
        onPress={() => navigation.onPrevious?.()}
        isDisabled={!navigation.onPrevious}
      />
      <Text as="span" variant="ui" tone="secondary">
        {formatMessage(messages.position, {
          position: navigation.position,
          total: navigation.total,
        })}
      </Text>
      <IconButton
        icon="chevron-right-16"
        size={24}
        aria-label={formatMessage(messages.nextTerm, { term })}
        onPress={() => navigation.onNext?.()}
        isDisabled={!navigation.onNext}
      />
    </div>
  );
};

export default PanelHeader;
