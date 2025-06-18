import React from 'react';

import { IconNames } from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

interface Props {
  className?: string;
  buttonText: string;
  iconName?: IconNames;
  onClick?: () => void;
  ariaExpanded?: boolean;
}

const IdeaCTAButton = ({
  className,
  buttonText,
  iconName,
  onClick,
  ariaExpanded,
}: Props) => {
  return (
    <ButtonWithLink
      className={className}
      icon={iconName}
      buttonStyle="white"
      fontWeight="500"
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    >
      {buttonText}
    </ButtonWithLink>
  );
};

export default IdeaCTAButton;
