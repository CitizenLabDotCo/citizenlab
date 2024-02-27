import React, { useState } from 'react';
import { lighten } from 'polished';
import {
  Box,
  colors,
  Title,
  BoxProps,
  Text,
  Image,
} from '@citizenlab/cl2-component-library';

type CardButtonProps = {
  selected: boolean;
  title: string;
  subtitle: string;
  image: string;
  onClick: (event) => void;
};

export const backgroundColor = lighten(0.1, colors.tealLight);

const ParticipationMethodChoice = ({
  selected,
  title,
  subtitle,
  image,
  onClick,
}: CardButtonProps & BoxProps) => {
  const [isHover, setIsHover] = useState(false);
  const borderColor = selected || isHover ? colors.primary : colors.borderLight;

  return (
    <Box
      display="flex"
      flexDirection="column"
      borderRadius="3px"
      border={`1px solid ${borderColor}`}
      padding="16px"
      gap="8px"
      flex="1 0 0"
      alignItems="flex-start"
      as="button"
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <Image width="188px" src={image} alt={'Ideation'} />
      <Title
        my="0px"
        variant="h6"
        color={selected ? 'primary' : 'coolGrey500'}
        textAlign="left"
      >
        {title}
      </Title>
      <Text
        my="0px"
        variant="bodyS"
        color={selected ? 'primary' : 'coolGrey500'}
        textAlign="left"
      >
        {subtitle}
      </Text>
    </Box>
  );
};

export default ParticipationMethodChoice;
