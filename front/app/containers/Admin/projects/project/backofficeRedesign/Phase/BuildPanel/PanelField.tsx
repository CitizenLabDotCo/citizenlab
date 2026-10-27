import React, { ReactNode } from 'react';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';

interface Props {
  label: string;
  labelTooltip?: JSX.Element;
  action?: ReactNode;
  children?: ReactNode;
}

const PanelField = ({ label, labelTooltip, action, children }: Props) => (
  <SetupCard title={label} titleTooltip={labelTooltip} action={action}>
    {children}
  </SetupCard>
);

export default PanelField;
