import React, { useState } from 'react';

import { colors } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';
import Icon, { IconNames } from '../Icon';
import Text from '../Text';
import Title from '../Title';

type CardButtonProps = {
  selected?: boolean;
  iconName?: IconNames;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  titleLabel?: React.ReactNode;
  subtitle?: React.ReactNode;
  disabled?: boolean;
};

const CardButton = ({
  selected = false,
  iconName,
  icon,
  title,
  titleLabel,
  subtitle,
  disabled = false,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: CardButtonProps & BoxProps) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      width="240px"
      minHeight="210px"
      background={selected || isHover ? colors.teal50 : colors.white}
      onMouseEnter={(e) => {
        setIsHover(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHover(false);
        onMouseLeave?.(e);
      }}
      padding="16px"
      border={
        selected ? `solid 1px ${colors.primary}` : `solid 1px ${colors.grey400}`
      }
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      as={'button' as unknown as undefined}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      disabled={disabled}
      {...rest}
    >
      {iconName && (
        <Icon
          width="28px"
          height="28px"
          name={iconName}
          fill={disabled ? colors.disabled : colors.teal200}
        />
      )}
      {icon ?? null}
      {title && (
        <Box display="flex" flexDirection="row" alignItems="center">
          <Title
            variant="h5"
            color={disabled ? 'disabled' : 'primary'}
            textAlign="left"
          >
            {title}
          </Title>
          {titleLabel && (
            <Box ml="8px" mt="8px">
              {titleLabel}
            </Box>
          )}
        </Box>
      )}
      {subtitle && (
        <Text
          fontSize="s"
          color={disabled ? 'disabled' : 'primary'}
          textAlign="left"
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

export default CardButton;
