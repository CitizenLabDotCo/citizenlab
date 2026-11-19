import React, { ReactNode } from 'react';

import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  Heading,
  PressEvent,
} from 'react-aria-components';

import Icon, { IconName } from '../Icon';
import { SpinnerGraphic } from '../Spinner';

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
  isExpanded?: boolean;
  onExpandedChange?: (isExpanded: boolean) => void;
  isDisabled?: boolean;
  children?: ReactNode;
};

type ButtonHeaderProps = SharedProps & {
  header: 'button';
  actionIcon: IconName;
  onPress?: (e: PressEvent) => void;
  isDisabled?: boolean;
  // Swaps the action icon for a spinner while the action runs.
  isPending?: boolean;
};

type StaticHeaderProps = SharedProps & {
  header: 'static';
  actions?: ReactNode;
  // An always-visible body.
  children?: ReactNode;
};

type Props = DisclosureHeaderProps | ButtonHeaderProps | StaticHeaderProps;

const HeaderContent = ({ title, status, summary }: SharedProps) => (
  <>
    <span className={styles.title}>{title}</span>
    {status && <span className={styles.slot}>{status}</span>}
    {summary && <span className={styles.summary}>{summary}</span>}
  </>
);

const DisclosureCard = ({
  isExpanded,
  onExpandedChange,
  children,
  isDisabled = false,
  ...content
}: DisclosureHeaderProps) => (
  <AriaDisclosure
    className={styles.card}
    isExpanded={isExpanded}
    onExpandedChange={onExpandedChange}
    isDisabled={isDisabled}
  >
    <Heading level={4} className={styles.heading}>
      <AriaButton slot="trigger" className={styles.trigger}>
        <HeaderContent {...content} />
        <span className={styles.iconBox}>
          <Icon name="chevron-down-16" className={styles.chevron} />
        </span>
      </AriaButton>
    </Heading>
    <DisclosurePanel className={styles.panel}>
      <div className={styles.panelContent}>{children}</div>
    </DisclosurePanel>
  </AriaDisclosure>
);

const ButtonCard = ({
  actionIcon,
  onPress,
  isDisabled = false,
  isPending = false,
  ...content
}: ButtonHeaderProps) => (
  <div className={styles.card} data-disabled={isDisabled || undefined}>
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
  </div>
);

const StaticCard = ({ actions, children, ...content }: StaticHeaderProps) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <HeaderContent {...content} />
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
    {children && <div className={styles.body}>{children}</div>}
  </div>
);

const Disclosure = (props: Props) => {
  if (props.header === 'button') return <ButtonCard {...props} />;
  if (props.header === 'static') return <StaticCard {...props} />;
  return <DisclosureCard {...props} />;
};

export default Disclosure;
