import React, { ReactNode } from 'react';

import { SetupReviewCard } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import { CardButton } from 'containers/Admin/projects/_shared/components/SetupCardButton';

interface Props {
  label: string;
  reviewKey?: SetupReviewCard;
  labelTooltip?: JSX.Element;
  action?: ReactNode;
  button?: CardButton;
  children?: ReactNode;
}

const PanelField = ({
  label,
  reviewKey,
  labelTooltip,
  action,
  button,
  children,
}: Props) => (
  <SetupCard
    title={label}
    reviewKey={reviewKey}
    titleTooltip={labelTooltip}
    action={action}
    button={button}
  >
    {children}
  </SetupCard>
);

export default PanelField;
