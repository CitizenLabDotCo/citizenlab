import React, { ReactNode, useCallback, useContext, useState } from 'react';

import { SetupReviewCard } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import RevealGroupContext from 'components/admin/MultilocFields/RevealGroupContext';

import ExpandAllContext from './ExpandAllContext';
import styles from './PanelGroup.module.css';
import 'design-system/tokens.css';

interface Props {
  label: string;
  reviewKey?: SetupReviewCard;
  reviewNeedsChoice?: boolean;
  defaultOpen?: boolean;
  /** Shown as a pill in the card header while the group is closed. */
  summary?: string;
  // Holds it open while a field inside shows an error, so the error can be seen.
  hasError?: boolean;
  onClose?: () => void;
  children: ReactNode;
}

const PanelGroup = ({
  label,
  reviewKey,
  reviewNeedsChoice,
  defaultOpen = false,
  summary,
  hasError = false,
  onClose,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  const expandAll = useContext(ExpandAllContext).count;
  const [seenExpandAll, setSeenExpandAll] = useState(expandAll);

  // Opens on each Expand all press; adjusted during render, as React recommends for derived state.
  if (expandAll !== seenExpandAll) {
    setSeenExpandAll(expandAll);
    setOpen(true);
  }
  const isOpen = open || hasError;
  const reveal = useCallback(() => setOpen(true), []);
  const toggle = () => {
    if (isOpen) onClose?.();
    setOpen(!isOpen);
  };

  return (
    <div className={styles.group}>
      <SetupCard
        title={label}
        reviewKey={reviewKey}
        reviewNeedsChoice={reviewNeedsChoice}
        action={summary && <SummaryPill label={summary} />}
        button={{
          icon: isOpen ? 'chevron-up' : 'chevron-down',
          expanded: isOpen,
          onClick: toggle,
        }}
      >
        {/* Kept mounted while closed, so unsaved edits inside stay registered for saving. */}
        <RevealGroupContext.Provider value={reveal}>
          {children}
        </RevealGroupContext.Provider>
      </SetupCard>
    </div>
  );
};

export default PanelGroup;
