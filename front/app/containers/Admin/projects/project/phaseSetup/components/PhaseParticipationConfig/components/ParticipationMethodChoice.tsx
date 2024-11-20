import React, { useState } from 'react';

import {
  Box,
  colors,
  Title,
  Text,
  Image,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';

type Props = {
  selected: boolean;
  title: string;
  subtitle?: string;
  image?: string;
  onClick?: (event) => void;
  children?: JSX.Element;
  participation_method: string;
};

export const backgroundColor = lighten(0.1, colors.tealLight);

interface ChildTextProps {
  selected: boolean;
  children: React.ReactNode;
}

export const ChildText = ({ selected, children }: ChildTextProps) => (
  <Text
    my="0px"
    variant="bodyS"
    color={selected ? 'primary' : 'coolGrey500'}
    textAlign="left"
    width="100%"
    style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
  >
    {children}
  </Text>
);

const ParticipationMethodChoice = ({
  selected,
  title,
  subtitle,
  image,
  onClick,
  children,
  participation_method,
}: Props) => {
  const [isHover, setIsHover] = useState(false);
  const borderColor = selected || isHover ? colors.primary : colors.borderLight;

  return (
    <Box
      display="flex"
      width="240px"
      flexDirection="column"
      borderRadius="3px"
      border={`1px solid ${borderColor}`}
      background={selected || isHover ? backgroundColor : colors.white}
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
      height="100%"
      id={`e2e-participation-method-choice-${participation_method}`}
    >
      {image && (
        <Image
          width="188px"
          src={image}
          alt={'Ideation'}
          w="100%"
          style={{
            ...(selected ? {} : { filter: 'grayscale(100%)', opacity: '50%' }),
          }}
        />
      )}
      {title && (
        <Title
          my="0px"
          variant="h6"
          color={selected ? 'primary' : 'coolGrey500'}
          textAlign="left"
          width="100%"
          style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
        >
          {title}
        </Title>
      )}
      {children}
      {subtitle && (
        <Text
          my="0px"
          variant="bodyS"
          color={selected ? 'primary' : 'coolGrey500'}
          textAlign="left"
          width="100%"
          style={{ overflowWrap: 'break-word', wordWrap: 'break-word' }}
        >
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

export default ParticipationMethodChoice;
