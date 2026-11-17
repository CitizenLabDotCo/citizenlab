import React, { ReactNode } from 'react';

import Badge from 'design-system/Badge';
import Disclosure from 'design-system/Disclosure';
import { IconName } from 'design-system/Icon';

import { ScreenReaderOnly } from 'utils/a11y';

import ReadyMark from './ReadyMark';
import styles from './SetupCard.module.css';
import SetupCardTooltip from './SetupCardTooltip';

type Behaviour =
  | { kind: 'expand'; children: ReactNode }
  | {
      kind: 'action';
      icon: IconName;
      actionLabel?: string;
      onClick: () => void;
    }
  // The card is the trigger of the MenuTrigger or DialogTrigger around it.
  | { kind: 'trigger' };

interface Props {
  id: string;
  title: string;
  tooltip?: string;
  ready?: boolean;
  summary?: string;
  behaviour: Behaviour;
}

const SetupCard = ({
  id,
  title,
  tooltip,
  ready,
  summary,
  behaviour,
}: Props) => {
  const cardTitle = (
    <>
      {ready !== undefined && (
        <span className={styles.mark}>
          <ReadyMark ready={ready} />
        </span>
      )}
      {title}
      {behaviour.kind === 'action' && behaviour.actionLabel && (
        <ScreenReaderOnly>{`, ${behaviour.actionLabel}`}</ScreenReaderOnly>
      )}
    </>
  );
  const badge = summary && <Badge tone="selected">{summary}</Badge>;

  // Disclosure takes no DOM id, so the wrapper keeps it.
  return (
    <div id={id}>
      <SetupCardTooltip content={tooltip}>
        {behaviour.kind === 'expand' ? (
          <Disclosure title={cardTitle} summary={badge}>
            {behaviour.children}
          </Disclosure>
        ) : (
          <Disclosure
            header="button"
            title={cardTitle}
            summary={badge}
            actionIcon={
              behaviour.kind === 'action' ? behaviour.icon : 'chevron-down-16'
            }
            onPress={
              behaviour.kind === 'action' ? behaviour.onClick : undefined
            }
          />
        )}
      </SetupCardTooltip>
    </div>
  );
};

export default SetupCard;
