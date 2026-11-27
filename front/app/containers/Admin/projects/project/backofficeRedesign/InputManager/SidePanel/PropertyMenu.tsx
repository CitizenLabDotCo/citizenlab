import React, { ReactNode } from 'react';

import { MenuTrigger } from 'design-system/Menu';
import PillButton from 'design-system/PillButton';

interface Props {
  label?: string;
  // While the change saves, the spinner shows in the control that was used.
  isPending?: boolean;
  // An OptionList.
  children: ReactNode;
}

const PropertyMenu = ({ label, isPending = false, children }: Props) => (
  <MenuTrigger>
    <PillButton isPending={isPending}>{label}</PillButton>
    {children}
  </MenuTrigger>
);

export default PropertyMenu;
