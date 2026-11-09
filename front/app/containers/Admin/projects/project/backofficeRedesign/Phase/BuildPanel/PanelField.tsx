import React, { ReactNode } from 'react';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import { CardButton } from 'containers/Admin/projects/_shared/components/SetupCardButton';

interface Props {
  label: string;
  labelTooltip?: JSX.Element;
  action?: ReactNode;
  button?: CardButton;
  children?: ReactNode;
}

const PanelField = ({
  label,
  labelTooltip,
  action,
  button,
  children,
}: Props) => (
  <SetupCard
    title={label}
    titleTooltip={labelTooltip}
    action={action}
    button={button}
  >
    {children}
  </SetupCard>
);

export default PanelField;
