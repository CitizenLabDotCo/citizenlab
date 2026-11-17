import React, { ReactNode, useState } from 'react';

import { SetupReviewCard } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import styles from './PanelGroup.module.css';
import 'design-system/tokens.css';

interface Props {
  label: string;
  reviewKey?: SetupReviewCard;
  reviewNeedsChoice?: boolean;
  defaultOpen?: boolean;
  /** Shown as a pill in the card header while the group is closed. */
  summary?: string;
  onClose?: () => void;
  children: ReactNode;
}

const PanelGroup = ({
  label,
  reviewKey,
  reviewNeedsChoice,
  defaultOpen = false,
  summary,
  onClose,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    if (open) onClose?.();
    setOpen(!open);
  };

  return (
    <div className={styles.group}>
      <SetupCard
        title={label}
        reviewKey={reviewKey}
        reviewNeedsChoice={reviewNeedsChoice}
        action={summary && <SummaryPill label={summary} />}
        button={{
          icon: open ? 'chevron-up' : 'chevron-down',
          expanded: open,
          onClick: toggle,
        }}
      >
        {open && children}
      </SetupCard>
    </div>
  );
};

export default PanelGroup;
