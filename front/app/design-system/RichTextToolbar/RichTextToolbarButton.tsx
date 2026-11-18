import React from 'react';

import { Button, PressEvent, ToggleButton } from 'react-aria-components';

import Icon, { IconName } from '../Icon';

import styles from './RichTextToolbar.module.css';
import '../tokens.css';

type ContentProps =
  | { icon: IconName; text?: undefined; 'aria-label': string }
  // A short text where no icon is drawn yet. Without an aria-label the text names the button.
  | { icon?: undefined; text: string; 'aria-label'?: string };

type RichTextToolbarButtonProps = ContentProps & {
  // Set for toggles (bold, list); leave out for actions (link, image), which
  // then render as plain buttons rather than "not pressed" toggles.
  isSelected?: boolean;
  onPress?: (e: PressEvent) => void;
  // The trigger of a Menu inside a MenuTrigger (e.g. the heading picker): a
  // plain button with the dropdown chevron, no pressed state.
  hasMenu?: boolean;
};

const RichTextToolbarButton = ({
  icon,
  text,
  isSelected,
  onPress,
  hasMenu = false,
  'aria-label': ariaLabel,
}: RichTextToolbarButtonProps) => {
  const className = `${styles.button} ${
    text === undefined ? '' : styles.withText
  }`;
  const content = (
    <>
      {icon && <Icon name={icon} className={styles.icon} />}
      {text !== undefined && <span className={styles.text}>{text}</span>}
      {hasMenu && <Icon name="chevron-down-12" className={styles.chevron} />}
    </>
  );

  if (hasMenu) {
    return (
      <Button className={className} aria-label={ariaLabel}>
        {content}
      </Button>
    );
  }

  if (isSelected === undefined) {
    return (
      <Button className={className} onPress={onPress} aria-label={ariaLabel}>
        {content}
      </Button>
    );
  }

  return (
    <ToggleButton
      className={className}
      isSelected={isSelected}
      onPress={onPress}
      aria-label={ariaLabel}
    >
      {content}
    </ToggleButton>
  );
};

export default RichTextToolbarButton;
