import React from 'react';

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
  onClick: () => void;
}

const IconAction = ({ icon, tooltip, ariaLabel, onClick }: Props) => (
  <Tooltip content={tooltip} theme="dark">
    <Button
      buttonStyle="bo-text"
      icon={icon}
      iconSize="16px"
      iconColor={colors.coolGrey500}
      iconHoverColor={bo.colors.textHeadingStrong}
      width="28px"
      height="28px"
      padding="0"
      ariaLabel={ariaLabel}
      onClick={onClick}
    />
  </Tooltip>
);

export default IconAction;
