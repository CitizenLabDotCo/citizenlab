import React, { ReactElement, ReactNode } from 'react';

import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  Key,
  PressEvent,
} from 'react-aria-components';

import { RequiredMarker } from '../Field';
import Icon, { IconName } from '../Icon';
import '../tokens.css';
import Tooltip from '../Tooltip';

import styles from './Disclosure.module.css';

type SharedProps = {
  title: ReactNode;
  // A Review status.
  status?: ReactNode;
  // Plain grey text, e.g. "Not set".
  value?: ReactNode;
  // A Badge. Hidden while the card is expanded.
  summary?: ReactNode;
  isRequired?: boolean;
  isDisabled?: boolean;
  // Looks disabled but stays focusable so the tooltip can say why.
  disabledReason?: ReactNode;
  'data-cy'?: string;
};

type DisclosureHeaderProps = SharedProps & {
  header?: 'disclosure';
  icon?: IconName;
  // The key of this card in a DisclosureGroup.
  id?: Key;
  isExpanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  children?: ReactNode;
};

type ButtonHeaderProps = SharedProps & {
  header: 'button';
  actionIcon?: IconName;
  onPress?: (e: PressEvent) => void;
};

type StaticHeaderProps = SharedProps & {
  header: 'static';
  actions?: ReactNode;
  // An always-visible body.
  children?: ReactNode;
};

export type DisclosureProps =
  | DisclosureHeaderProps
  | ButtonHeaderProps
  | StaticHeaderProps;

const HeaderContent = ({
  title,
  status,
  value,
  summary,
  isRequired,
}: SharedProps) => (
  <>
    <span className={styles.title}>{title}</span>
    {status && <span className={styles.slot}>{status}</span>}
    {value && <span className={styles.value}>{value}</span>}
    {summary && <span className={styles.summary}>{summary}</span>}
    {isRequired && (
      <span className={styles.slot}>
        <RequiredMarker />
      </span>
    )}
  </>
);

const withReason = (trigger: ReactElement, disabledReason: ReactNode) =>
  disabledReason ? (
    <Tooltip content={disabledReason}>{trigger}</Tooltip>
  ) : (
    trigger
  );

const DisclosureCard = ({
  icon = 'chevron-down-16',
  id,
  isExpanded,
  defaultExpanded,
  onExpandedChange,
  children,
  isDisabled = false,
  disabledReason,
  'data-cy': dataCy,
  ...content
}: DisclosureHeaderProps) => {
  const hasReason = !!disabledReason;

  return (
    <AriaDisclosure
      id={id}
      className={styles.card}
      isExpanded={isExpanded}
      defaultExpanded={defaultExpanded}
      onExpandedChange={onExpandedChange}
      // The reason keeps the trigger focusable, so the Disclosure blocks the toggle instead.
      isDisabled={isDisabled || hasReason}
      data-cy={dataCy}
    >
      {withReason(
        <AriaButton
          slot="trigger"
          className={styles.trigger}
          isDisabled={hasReason ? false : undefined}
          aria-disabled={hasReason ? true : undefined}
        >
          <HeaderContent {...content} />
          <span className={styles.iconBox}>
            <Icon name={icon} className={styles.chevron} />
          </span>
        </AriaButton>,
        disabledReason
      )}
      <DisclosurePanel className={styles.panel}>
        <div className={styles.panelContent}>{children}</div>
      </DisclosurePanel>
    </AriaDisclosure>
  );
};

const ButtonCard = ({
  actionIcon = 'plus-16',
  onPress,
  isDisabled = false,
  disabledReason,
  'data-cy': dataCy,
  ...content
}: ButtonHeaderProps) => {
  const hasReason = !!disabledReason;

  return (
    <div
      className={styles.card}
      data-disabled={isDisabled || hasReason || undefined}
      data-cy={dataCy}
    >
      {withReason(
        <AriaButton
          className={styles.trigger}
          isDisabled={isDisabled && !hasReason}
          aria-disabled={hasReason ? true : undefined}
          onPress={hasReason ? undefined : onPress}
        >
          <HeaderContent {...content} />
          <span className={styles.iconBox}>
            <Icon name={actionIcon} />
          </span>
        </AriaButton>,
        disabledReason
      )}
    </div>
  );
};

const StaticCard = ({
  actions,
  children,
  isDisabled = false,
  'data-cy': dataCy,
  ...content
}: StaticHeaderProps) => (
  <div
    className={styles.card}
    data-disabled={isDisabled || undefined}
    data-cy={dataCy}
  >
    <div className={styles.header}>
      <HeaderContent {...content} />
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
    {children && <div className={styles.body}>{children}</div>}
  </div>
);

const Disclosure = (props: DisclosureProps) => {
  if (props.header === 'button') return <ButtonCard {...props} />;
  if (props.header === 'static') return <StaticCard {...props} />;
  return <DisclosureCard {...props} />;
};

export default Disclosure;
export { default as DisclosureGroup } from './DisclosureGroup';
export type { DisclosureGroupProps } from './DisclosureGroup';
