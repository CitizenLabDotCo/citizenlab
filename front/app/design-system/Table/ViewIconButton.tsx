import React from 'react';

import { Button as AriaButton, PressEvent } from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './ViewIconButton.module.css';

export type ViewIconButtonProps = {
  // grip-vertical-16 (Arrange) or search-16 (Search).
  icon: IconName;
  // Names the button and is the text of its tooltip.
  'aria-label': string;
  onPress?: (e: PressEvent) => void;
  'data-cy'?: string;
};

const ViewIconButton = ({
  icon,
  'aria-label': ariaLabel,
  onPress,
  'data-cy': dataCy,
}: ViewIconButtonProps) => (
  <Tooltip content={ariaLabel}>
    <AriaButton
      className={styles.button}
      onPress={onPress}
      aria-label={ariaLabel}
      data-cy={dataCy}
    >
      <Icon name={icon} className={styles.icon} />
    </AriaButton>
  </Tooltip>
);

export default ViewIconButton;
