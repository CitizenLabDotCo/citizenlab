import React from 'react';

import ProposedValue from './ProposedValue';
import SavedValue from './SavedValue';

type Props = {
  changed: boolean;
  // The saved value that a proposed update replaces.
  previous?: string | null;
  children?: string | null;
};

const ChangedValue = ({ changed, previous, children }: Props) => {
  if (!changed || previous === children) return <>{children}</>;

  return (
    <>
      {previous && <SavedValue>{previous}</SavedValue>}
      {previous && children && <span aria-hidden> → </span>}
      {children && <ProposedValue>{children}</ProposedValue>}
    </>
  );
};

export default ChangedValue;
