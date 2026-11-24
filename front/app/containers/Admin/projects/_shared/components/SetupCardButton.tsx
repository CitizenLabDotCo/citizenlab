import React, { ReactNode } from 'react';

import Disclosure from 'design-system/Disclosure';
import { IconName } from 'design-system/Icon';
import IconButton from 'design-system/IconButton';

import { ScreenReaderOnly } from 'utils/a11y';

type CardIcon =
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'plus'
  | 'edit';

export interface CardButton {
  icon: CardIcon;
  onClick: () => void;
  actionLabel?: string;
  expanded?: boolean;
  disabled?: boolean;
  describedBy?: string;
}

const ACTION_ICONS: Record<CardIcon, IconName> = {
  'chevron-right': 'chevron-right-16',
  'chevron-down': 'chevron-down-16',
  'chevron-up': 'chevron-down-16',
  plus: 'plus-16',
  edit: 'pencil-14',
};

interface Props {
  title: string;
  titleTooltip?: JSX.Element;
  /** A review status, shown next to the title. */
  status?: ReactNode;
  action?: ReactNode;
  button: CardButton;
  children?: ReactNode;
}

const SetupCardButton = ({
  title,
  titleTooltip,
  status,
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
        tooltip={titleTooltip}
        status={status}
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
        status={status}
        summary={action}
        actions={
          <IconButton
            icon={ACTION_ICONS[button.icon]}
            aria-label={button.actionLabel ?? title}
            aria-describedby={button.describedBy}
            isDisabled={button.disabled}
            onPress={button.onClick}
          />
        }
      >
        {children}
      </Disclosure>
    );
  }

  return (
    <Disclosure
      header="button"
      tooltip={titleTooltip}
      title={titleWithAction}
      status={status}
      summary={action}
      actionIcon={ACTION_ICONS[button.icon]}
      isDisabled={button.disabled}
      onPress={button.onClick}
    />
  );
};

export default SetupCardButton;
