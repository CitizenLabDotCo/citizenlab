import React, { ReactNode, useState } from 'react';

import Disclosure from 'design-system/Disclosure';
import 'design-system/tokens.css';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import styles from './PanelGroup.module.css';

interface Props {
  label: string;
  defaultOpen?: boolean;
  /** Shown as a pill in the card header while the group is closed. */
  summary?: string;
  children: ReactNode;
}

const PanelGroup = ({
  label,
  defaultOpen = false,
  summary,
  children,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.group}>
      <Disclosure
        title={label}
        summary={summary && <SummaryPill label={summary} />}
        isExpanded={open}
        onExpandedChange={setOpen}
      >
        {open && children}
      </Disclosure>
    </div>
  );
};

export default PanelGroup;
