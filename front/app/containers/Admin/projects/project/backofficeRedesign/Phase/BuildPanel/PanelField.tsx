import React, { ReactNode } from 'react';

import { SetupReviewCard } from 'api/phases/types';

import SetupCard from 'containers/Admin/projects/_shared/components/SetupCard';
import { CardButton } from 'containers/Admin/projects/_shared/components/SetupCardButton';

interface Props {
  label: string;
  spacedBody?: boolean;
  reviewKey?: SetupReviewCard;
  labelTooltip?: JSX.Element;
  action?: ReactNode;
  button?: CardButton;
  menu?: ReactNode;
  children?: ReactNode;
}

const PanelField = ({
  label,
  spacedBody,
  reviewKey,
  labelTooltip,
  action,
  button,
  menu,
  children,
}: Props) => (
  <SetupCard
    title={label}
    spacedBody={spacedBody}
    reviewKey={reviewKey}
    titleTooltip={labelTooltip}
    action={action}
    button={button}
    menu={menu}
  >
    {children}
  </SetupCard>
);

export default PanelField;
