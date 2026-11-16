import React, { ReactNode } from 'react';

import Badge from 'design-system/Badge';
import Disclosure from 'design-system/Disclosure';
import { IconName } from 'design-system/Icon';

import { ScreenReaderOnly } from 'utils/a11y';

import ReadyMark from './ReadyMark';
import styles from './SetupCard.module.css';

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
  ready?: boolean;
  summary?: string;
  behaviour: Behaviour;
}

const SetupCard = ({ id, title, ready, summary, behaviour }: Props) => {
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
          onPress={behaviour.kind === 'action' ? behaviour.onClick : undefined}
        />
      )}
    </div>
  );
};

export default SetupCard;
