import React, { useState } from 'react';

import { lighten } from 'polished';

import { colors } from '../../utils/styleUtils';
import Box, { BoxProps } from '../Box';
import Icon, { IconNames } from '../Icon';
import Text from '../Text';
import Title from '../Title';

type CardButtonProps = {
  selected?: boolean;
  iconName?: IconNames;
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
};

// TODO: Temporary colour until new tealLight variations added to component library
export const backgroundColor = lighten(0.1, colors.tealLight);

const CardButton = ({
  selected,
  iconName,
  icon,
  title,
  subtitle,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: CardButtonProps & BoxProps) => {
  const [isHover, setIsHover] = useState(false);

  return (
    <Box
      width="240px"
      minHeight="210px"
      background={selected || isHover ? backgroundColor : colors.white}
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
      style={{ cursor: 'pointer' }}
      as={'button' as unknown as undefined}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      justifyContent="flex-start"
      {...rest}
    >
      {iconName && (
        <Icon
          width="28px"
          height="28px"
          name={iconName}
          fill={selected ? colors.teal200 : colors.grey400}
        />
      )}
      {icon ?? null}
      {title && (
        <Title
          styleVariant="h5"
          color={selected ? 'primary' : 'coolGrey700'}
          textAlign="left"
        >
          {title}
        </Title>
      )}
      {subtitle && (
        <Text
          fontSize="s"
          color={selected ? 'primary' : 'coolGrey700'}
          textAlign="left"
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

export default CardButton;
