import React from 'react';
import Button from 'components/UI/Button';
import { withTheme } from 'styled-components';
import { IconNames, colors } from 'cl2-component-library';
import { darken } from 'polished';

interface Props {
  className?: string;
  copy: string;
  theme: any;
  iconName?: IconNames;
  onClick: () => void;
}

const IdeaCTAButton = ({
  className,
  copy,
  theme,
  iconName,
  onClick,
}: Props) => {
  const buttonColor = 'white';
  const boxShadow = '0px 4px 3px rgba(0, 0, 0, 0.05)'; // TODO: add to styleutils
  const boxShadowOnHover = '0px 4px 3px rgba(0, 0, 0, 0.1)';

  return (
    <Button
      className={className}
      bgColor={buttonColor}
      boxShadow={boxShadow}
      textColor={theme.colorText}
      icon={iconName}
      iconColor={colors.clIconSecondary}
      iconHoverColor={colors.clIconSecondary}
      bgHoverColor={buttonColor}
      textHoverColor={darken(0.1, theme.colorText)}
      boxShadowHover={boxShadowOnHover}
      fontWeight="bold"
      onClick={onClick}
    >
      {copy}
    </Button>
  );
};

export default withTheme(IdeaCTAButton);
