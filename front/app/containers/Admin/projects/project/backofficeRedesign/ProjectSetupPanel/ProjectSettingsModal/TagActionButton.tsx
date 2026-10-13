import React from 'react';

import { Button, IconNames } from '@citizenlab/cl2-component-library';

interface Props {
  iconName: IconNames;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

const TagActionButton = ({ iconName, label, disabled, onClick }: Props) => (
  <Button
    buttonStyle="bo-secondary"
    icon={iconName}
    width="28px"
    height="28px"
    padding="0"
    ariaLabel={label}
    disabled={disabled}
    onClick={onClick}
  />
);

export default TagActionButton;
