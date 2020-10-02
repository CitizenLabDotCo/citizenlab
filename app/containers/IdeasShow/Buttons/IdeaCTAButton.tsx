import React from 'react';
import Button from 'components/UI/Button';
import { withTheme } from 'styled-components';
import { IconNames, colors, defaultStyles } from 'cl2-component-library';
import { darken } from 'polished';

interface Props {
  className?: string;
  buttonText: string;
  theme: any;
  iconName?: IconNames;
  onClick?: () => void;
  ariaExpanded?: boolean;
}

const IdeaCTAButton = ({
  className,
  buttonText,
  theme,
  iconName,
  onClick,
  ariaExpanded,
}: Props) => {
  return (
    <Button
      className={className}
      bgColor={'#fff'}
      boxShadow={defaultStyles.boxShadow}
      textColor={theme.colorText}
      icon={iconName}
      iconColor={colors.clIconSecondary}
      iconHoverColor={colors.clIconSecondary}
      iconAriaHidden
      bgHoverColor={'#fff'}
      textHoverColor={darken(0.1, theme.colorText)}
      boxShadowHover={defaultStyles.boxShadowHover}
      fontWeight="bold"
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    >
      {buttonText}
    </Button>
  );
};

export default withTheme(IdeaCTAButton);
