import {
  Box,
  Icon,
  Text,
  Title,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';
import React, { useState } from 'react';
import { lighten } from 'polished';

type PermissionCardButtonProps = {
  onClick: () => void;
  selected: boolean;
  iconName?: IconNames;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  id?: string;
  customIconSection?: React.ReactNode | null;
};
export const PermissionCardButton = ({
  onClick,
  selected,
  iconName,
  title,
  subtitle,
  id,
  customIconSection,
}: PermissionCardButtonProps) => {
  const [isHover, setIsHover] = useState(false);

  // TODO: Temporary colour until new tealLight variations added to component library
  const backgroundColor = lighten(0.1, colors.tealLight);

  return (
    <Box
      id={id}
      width="240px"
      minHeight="210px"
      background={selected || isHover ? backgroundColor : colors.white}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      onClick={onClick}
      padding="16px"
      border={
        selected ? `solid 1px ${colors.primary}` : `solid 1px ${colors.grey300}`
      }
      style={{ cursor: 'pointer' }}
    >
      {iconName && (
        <Icon
          width="28px"
          height="28px"
          name={iconName}
          fill={selected ? colors.teal200 : colors.grey300}
        />
      )}
      {customIconSection && customIconSection}
      <Title variant="h5" color={selected ? 'primary' : 'coolGrey500'}>
        {title}
      </Title>
      <Text fontSize="s" color={selected ? 'primary' : 'coolGrey500'}>
        {subtitle}
      </Text>
    </Box>
  );
};
