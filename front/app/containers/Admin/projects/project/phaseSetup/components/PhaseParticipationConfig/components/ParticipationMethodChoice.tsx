import React, { ReactNode, useState } from 'react';

import {
  Box,
  colors,
  Title,
  Text,
  Image,
} from '@citizenlab/cl2-component-library';
import { PressEvent } from 'react-aria-components';

import MethodCard from 'design-system/MethodCard';
import Tooltip from 'design-system/Tooltip';

import styles from './ParticipationMethodChoice.module.css';
import 'design-system/tokens.css';

type DefaultProps = {
  variant?: 'default';
  selected: boolean;
  title: string;
  subtitle?: string;
  image?: string;
  onClick?: (event) => void;
  children?: JSX.Element;
  participation_method: string;
  width?: string;
};

// A menu of actions, so no card looks selected.
type BoProps = {
  variant: 'panel';
  title: string;
  subtitle: string;
  image: string;
  onPress?: (event: PressEvent) => void;
  participation_method: string;
  /** Badges with use="note", shown under the description. */
  notes?: ReactNode;
  /** Shown on hover. */
  tooltip?: string;
  /** Shown on hover when the method can't be picked. */
  disabledReason?: string;
};

type Props = DefaultProps | BoProps;

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

const ParticipationMethodChoice = (props: Props) => {
  const [isHover, setIsHover] = useState(false);

  if (props.variant === 'panel') {
    const {
      title,
      subtitle,
      image,
      onPress,
      participation_method,
      notes,
      tooltip,
      disabledReason,
    } = props;
    const tooltipContent = disabledReason ?? tooltip;

    const card = (
      <MethodCard
        title={title}
        description={subtitle}
        art={<img className={styles.art} src={image} alt="" />}
        notes={notes}
        onPress={disabledReason ? undefined : onPress}
      />
    );

    return (
      <div
        id={`e2e-participation-method-choice-${participation_method}`}
        className={
          disabledReason ? `${styles.cell} ${styles.unavailable}` : styles.cell
        }
      >
        {tooltipContent ? (
          <Tooltip content={tooltipContent}>{card}</Tooltip>
        ) : (
          card
        )}
      </div>
    );
  }

  const {
    selected,
    title,
    subtitle,
    image,
    onClick,
    children,
    participation_method,
    width = '240px',
  } = props;
  const highlighted = selected || isHover;
  const textColor = selected ? 'primary' : 'coolGrey500';

  return (
    <Box
      display="flex"
      width={width}
      flexDirection="column"
      borderRadius="3px"
      border={`1px solid ${highlighted ? colors.primary : colors.borderLight}`}
      background={highlighted ? colors.teal50 : colors.white}
      opacity={1}
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
      aria-disabled={false}
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
            ...(!selected ? { filter: 'grayscale(100%)', opacity: '50%' } : {}),
          }}
        />
      )}
      {title && (
        <Title
          my="0px"
          variant="h6"
          color={textColor}
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
          color={textColor}
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
