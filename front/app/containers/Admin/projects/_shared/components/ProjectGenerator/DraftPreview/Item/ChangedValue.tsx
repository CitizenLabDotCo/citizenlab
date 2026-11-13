import React from 'react';

import ProposedValue from './ProposedValue';
import SavedValue from './SavedValue';

type Props = {
  changed: boolean;
  // The saved value that a proposed update replaces.
  previous?: string;
  children: string;
};

const ChangedValue = ({ changed, previous, children }: Props) => {
  if (!changed || previous === children) return <>{children}</>;
  if (!previous) return <ProposedValue>{children}</ProposedValue>;

  return (
    <>
      <SavedValue>{previous}</SavedValue>
      <span aria-hidden> → </span>
      <ProposedValue>{children}</ProposedValue>
    </>
  );
};

export default ChangedValue;
