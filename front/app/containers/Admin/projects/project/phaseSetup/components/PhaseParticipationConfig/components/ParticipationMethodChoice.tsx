import React, { useState } from 'react';

import {
  Box,
  colors,
  Title,
  Text,
  Image,
  Tooltip,
} from '@citizenlab/cl2-component-library';

type Props = {
  selected: boolean;
  title: string;
  subtitle?: string;
  image?: string;
  onClick?: (event) => void;
  children?: JSX.Element;
  participation_method: string;
  width?: string;
  /** Shown on hover when the method can't be picked. */
  disabledReason?: string;
};

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
  width = '240px',
  disabledReason,
}: Props) => {
  const [isHover, setIsHover] = useState(false);
  const disabled = !!disabledReason;
  const highlighted = selected || (isHover && !disabled);
  const borderColor = highlighted ? colors.primary : colors.borderLight;

  const card = (
    <Box
      display="flex"
      width={width}
      flexDirection="column"
      borderRadius="3px"
      border={`1px solid ${borderColor}`}
      background={highlighted ? colors.teal50 : colors.white}
      opacity={disabled ? 0.6 : 1}
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
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
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

  // Only a disabled card is wrapped: the tooltip's wrapper would otherwise stop
  // the card from filling its grid cell.
  if (!disabled) return card;

  return (
    <Tooltip
      content={disabledReason}
      placement="top"
      theme="dark"
      width={width}
    >
      {card}
    </Tooltip>
  );
};

export default ParticipationMethodChoice;
