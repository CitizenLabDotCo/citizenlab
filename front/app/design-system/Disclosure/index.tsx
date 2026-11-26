import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  Heading,
  MenuTrigger,
  PressEvent,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import { SpinnerGraphic } from '../Spinner';
import Tooltip from '../Tooltip';

import styles from './Disclosure.module.css';
import '../tokens.css';

type SharedProps = {
  title: ReactNode;
  // A Review status.
  status?: ReactNode;
  // A Badge. Hidden while the card is expanded.
  summary?: ReactNode;
};

type DisclosureHeaderProps = SharedProps & {
  header?: 'disclosure';
  tooltip?: ReactNode;
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  isDisabled?: boolean;
  children?: ReactNode;
};

type ButtonHeaderProps = SharedProps & {
  header: 'button';
  tooltip?: ReactNode;
  actionIcon: IconName;
  onPress?: (e: PressEvent) => void;
  isDisabled?: boolean;
  isPending?: boolean;
};

type MenuHeaderProps = SharedProps & {
  header: 'menu';
  tooltip?: ReactNode;
  // A Menu. It opens under the card; the summary Badge shows the picked value.
  menu: ReactNode;
  isDisabled?: boolean;
  'aria-describedby'?: string;
};

type StaticHeaderProps = SharedProps & {
  header: 'static';
  spacedBody?: boolean;
  actions?: ReactNode;
  // An always-visible body.
  children?: ReactNode;
};

type Props =
  | DisclosureHeaderProps
  | ButtonHeaderProps
  | MenuHeaderProps
  | StaticHeaderProps;

// The status goes last, so it keeps the same place next to the card's control
// whether or not a summary is shown.
const HeaderContent = ({ title, status, summary }: SharedProps) => (
  <>
    <span className={styles.title}>{title}</span>
    {summary && <span className={styles.summary}>{summary}</span>}
    {status && <span className={styles.slot}>{status}</span>}
  </>
);

const DisclosureCard = ({
  isExpanded,
  onExpandedChange,
  children,
  isDisabled = false,
  tooltip,
  ...content
}: DisclosureHeaderProps) => {
  const trigger = (
    <AriaButton slot="trigger" className={styles.trigger}>
      <HeaderContent {...content} />
      <span className={styles.iconBox}>
        <Icon name="chevron-down-16" className={styles.chevron} />
      </span>
    </AriaButton>
  );
  return (
    <AriaDisclosure
      className={styles.card}
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isDisabled={isDisabled}
    >
      <Heading level={4} className={styles.heading}>
        {tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger}
      </Heading>
      <DisclosurePanel className={styles.panel}>
        <div className={styles.panelContent}>{children}</div>
      </DisclosurePanel>
    </AriaDisclosure>
  );
};

const ButtonCard = ({
  actionIcon,
  onPress,
  isDisabled = false,
  isPending = false,
  tooltip,
  ...content
}: ButtonHeaderProps) => {
  const trigger = (
    <AriaButton
      className={styles.trigger}
      isDisabled={isDisabled}
      isPending={isPending}
      onPress={onPress}
    >
      <HeaderContent {...content} />
      <span className={styles.iconBox}>
        {isPending ? <SpinnerGraphic /> : <Icon name={actionIcon} />}
      </span>
    </AriaButton>
  );
  return (
    <div className={styles.card} data-disabled={isDisabled || undefined}>
      {tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger}
    </div>
  );
};

const MenuCard = ({
  menu,
  tooltip,
  isDisabled = false,
  'aria-describedby': ariaDescribedBy,
  ...content
}: MenuHeaderProps) => {
  const trigger = (
    <AriaButton
      className={styles.trigger}
      isDisabled={isDisabled}
      aria-describedby={ariaDescribedBy}
    >
      <HeaderContent {...content} />
      <span className={styles.iconBox}>
        <Icon name="chevron-down-16" />
      </span>
    </AriaButton>
  );
  return (
    <div className={styles.card} data-disabled={isDisabled || undefined}>
      <MenuTrigger>
        {tooltip ? <Tooltip content={tooltip}>{trigger}</Tooltip> : trigger}
        {menu}
      </MenuTrigger>
    </div>
  );
};

const StaticCard = ({
  actions,
  children,
  spacedBody,
  ...content
}: StaticHeaderProps) => (
  <div className={styles.card} data-spaced-body={spacedBody || undefined}>
    <div className={styles.header}>
      <HeaderContent {...content} />
      {actions ? (
        <div className={styles.actions}>{actions}</div>
      ) : (
        // Keeps the status as far from the edge as on cards with a control.
        content.status && <span className={styles.iconBox} aria-hidden />
      )}
    </div>
    {children && <div className={styles.body}>{children}</div>}
  </div>
);

const Disclosure = (props: Props) => {
  if (props.header === 'button') return <ButtonCard {...props} />;
  if (props.header === 'menu') return <MenuCard {...props} />;
  if (props.header === 'static') return <StaticCard {...props} />;
  return <DisclosureCard {...props} />;
};

export default Disclosure;
