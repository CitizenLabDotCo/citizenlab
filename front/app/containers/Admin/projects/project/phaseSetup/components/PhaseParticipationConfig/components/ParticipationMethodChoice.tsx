import React, { useState } from 'react';

import {
  Box,
  Color,
  bo,
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
  /** `bo`: a menu of actions, so no card looks selected or greyed out. */
  variant?: 'default' | 'bo';
};

interface Look {
  width: string;
  border: string;
  background: string;
  borderRadius: string;
  muted: boolean;
  titleColor: Color;
  subtitleColor: Color;
}

const getLook = (
  variant: 'default' | 'bo',
  width: string,
  selected: boolean,
  highlighted: boolean
): Look => {
  if (variant === 'bo') {
    return {
      width: '100%',
      border: highlighted ? bo.colors.sectionLabel : colors.grey200,
      background: highlighted ? colors.grey50 : colors.white,
      borderRadius: bo.panelBorderRadius,
      muted: false,
      titleColor: 'textPrimary',
      subtitleColor: 'textSecondary',
    };
  }

  const textColor = selected ? 'primary' : 'coolGrey500';

  return {
    width,
    border: highlighted ? colors.primary : colors.borderLight,
    background: highlighted ? colors.teal50 : colors.white,
    borderRadius: '3px',
    muted: !selected,
    titleColor: textColor,
    subtitleColor: textColor,
  };
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
  variant = 'default',
}: Props) => {
  const [isHover, setIsHover] = useState(false);
  const disabled = !!disabledReason;
  const highlighted = selected || (isHover && !disabled);
  const look = getLook(variant, width, selected, highlighted);

  const card = (
    <Box
      display="flex"
      width={look.width}
      flexDirection="column"
      borderRadius={look.borderRadius}
      border={`1px solid ${look.border}`}
      background={look.background}
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
            ...(look.muted
              ? { filter: 'grayscale(100%)', opacity: '50%' }
              : {}),
          }}
        />
      )}
      {title && (
        <Title
          my="0px"
          variant="h6"
          color={look.titleColor}
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
          color={look.subtitleColor}
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
      width={look.width}
    >
      {card}
    </Tooltip>
  );
};

export default ParticipationMethodChoice;
