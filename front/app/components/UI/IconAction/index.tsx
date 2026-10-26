import React, { MouseEvent } from 'react';

import {
  Button,
  IconNames,
  Tooltip,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

interface Props {
  icon: IconNames;
  tooltip: string;
  ariaLabel: string;
  onClick: (event: MouseEvent) => void;
  id?: string;
  disabled?: boolean;
  ariaExpanded?: boolean;
}

const IconAction = ({
  icon,
  tooltip,
  ariaLabel,
  onClick,
  id,
  disabled,
  ariaExpanded,
}: Props) => (
  <Tooltip content={tooltip} theme="dark">
    <Button
      id={id}
      buttonStyle="bo-text"
      icon={icon}
      iconSize="16px"
      iconColor={colors.coolGrey500}
      iconHoverColor={bo.colors.textHeadingStrong}
      width="28px"
      height="28px"
      padding="0"
      ariaLabel={ariaLabel}
      ariaExpanded={ariaExpanded}
      disabled={disabled}
      onClick={onClick}
    />
  </Tooltip>
);

export default IconAction;
