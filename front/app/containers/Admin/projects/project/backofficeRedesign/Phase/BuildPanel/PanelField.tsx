import React, { ReactNode } from 'react';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';

interface Props {
  label: string;
  action?: ReactNode;
  children?: ReactNode;
}

const PanelField = ({ label, action, children }: Props) => (
  <SetupCard title={label} action={action}>
    {children}
  </SetupCard>
);

export default PanelField;
