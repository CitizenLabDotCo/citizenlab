import React, { ReactNode } from 'react';

import Disclosure from 'design-system/Disclosure';
import { IconName } from 'design-system/Icon';
import IconButton from 'design-system/IconButton';
import Tooltip from 'design-system/Tooltip';

import { ScreenReaderOnly } from 'utils/a11y';

type CardIcon = 'chevron-right' | 'chevron-down' | 'chevron-up' | 'plus';

export interface CardButton {
  icon: CardIcon;
  onClick: () => void;
  actionLabel?: string;
  expanded?: boolean;
  disabled?: boolean;
}

const ACTION_ICONS: Record<CardIcon, IconName> = {
  'chevron-right': 'chevron-right-16',
  'chevron-down': 'chevron-down-16',
  'chevron-up': 'chevron-down-16',
  plus: 'plus-16',
};

interface Props {
  title: string;
  titleTooltip?: JSX.Element;
  action?: ReactNode;
  button: CardButton;
  children?: ReactNode;
}

const SetupCardButton = ({
  title,
  titleTooltip,
  action,
  button,
  children,
}: Props) => {
  const titleWithAction = (
    <>
      {title}
      {button.actionLabel && (
        <ScreenReaderOnly>{`, ${button.actionLabel}`}</ScreenReaderOnly>
      )}
    </>
  );

  if (button.expanded !== undefined) {
    return (
      <Disclosure
        title={titleWithAction}
        summary={action}
        isExpanded={button.expanded}
        onExpandedChange={button.onClick}
        isDisabled={button.disabled}
      >
        {children}
      </Disclosure>
    );
  }

  // A button header has no body, so a card with content gets its action as
  // an icon button in a static header instead.
  if (children) {
    return (
      <Disclosure
        header="static"
        title={title}
        summary={action}
        actions={
          <IconButton
            icon={ACTION_ICONS[button.icon]}
            aria-label={button.actionLabel ?? title}
            isDisabled={button.disabled}
            onPress={button.onClick}
          />
        }
      >
        {children}
      </Disclosure>
    );
  }

  const card = (
    <Disclosure
      header="button"
      title={titleWithAction}
      summary={action}
      actionIcon={ACTION_ICONS[button.icon]}
      isDisabled={button.disabled}
      onPress={button.onClick}
    />
  );

  // The tooltip icon can't sit inside the header button, so the whole header
  // carries the tooltip instead.
  if (!titleTooltip) return card;

  return <Tooltip content={titleTooltip}>{card}</Tooltip>;
};

export default SetupCardButton;
