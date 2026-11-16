import React, { ReactNode } from 'react';

import { Button as AriaButton } from 'react-aria-components';

import Disclosure from 'design-system/Disclosure';
import Icon from 'design-system/Icon';
import Tooltip from 'design-system/Tooltip';
import 'design-system/tokens.css';

import styles from './SetupCard.module.css';
import SetupCardButton, { CardButton } from './SetupCardButton';

interface Props {
  title: string;
  titleTooltip?: JSX.Element;
  action?: ReactNode;
  button?: CardButton;
  children?: ReactNode;
}

const SetupCard = ({
  title,
  titleTooltip,
  action,
  button,
  children,
}: Props) => {
  if (button) {
    return (
      <SetupCardButton
        title={title}
        titleTooltip={titleTooltip}
        action={action}
        button={button}
      >
        {children}
      </SetupCardButton>
    );
  }

  return (
    <Disclosure
      header="static"
      title={
        titleTooltip ? (
          <span className={styles.titleRow}>
            {title}
            <Tooltip content={titleTooltip}>
              <AriaButton className={styles.infoButton} aria-label={title}>
                <Icon name="info-16" />
              </AriaButton>
            </Tooltip>
          </span>
        ) : (
          title
        )
      }
      actions={action}
    >
      {children}
    </Disclosure>
  );
};

export default SetupCard;
