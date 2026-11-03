import React, { ReactNode, useState } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';

import ReadyMark from './ReadyMark';

type Behaviour =
  | { kind: 'expand'; children: ReactNode }
  | {
      kind: 'action';
      icon: IconNames;
      actionLabel?: string;
      expanded?: boolean;
      onClick: () => void;
    };

const getTrailingIcon = (behaviour: Behaviour, open: boolean): IconNames => {
  if (behaviour.kind === 'action') return behaviour.icon;
  return open ? 'chevron-up' : 'chevron-down';
};

interface Props {
  id: string;
  title: string;
  ready?: boolean;
  summary?: string;
  behaviour: Behaviour;
}

const SetupCard = ({ id, title, ready, summary, behaviour }: Props) => {
  const [open, setOpen] = useState(false);
  const expandable = behaviour.kind === 'expand';
  const bodyId = `${id}-body`;

  const handleClick = () => {
    if (behaviour.kind === 'expand') {
      setOpen((open) => !open);
    } else {
      behaviour.onClick();
    }
  };

  return (
    <Box
      border={`1px solid ${colors.grey200}`}
      borderRadius={bo.borderRadius}
      background={colors.white}
    >
      <Box
        as="button"
        type="button"
        id={id}
        w="100%"
        minHeight="44px"
        display="flex"
        alignItems="center"
        gap="10px"
        p="8px 8px 8px 12px"
        background="transparent"
        border="none"
        cursor="pointer"
        aria-expanded={behaviour.kind === 'action' ? behaviour.expanded : open}
        aria-controls={expandable && open ? bodyId : undefined}
        onClick={handleClick}
      >
        {ready !== undefined && <ReadyMark ready={ready} />}
        <Box flex="1 1 auto" minWidth="0" display="flex">
          <Text variant="boControl" as="span" fontSize="xs" m="0">
            {title}
            {behaviour.kind === 'action' && behaviour.actionLabel && (
              <ScreenReaderOnly>{`, ${behaviour.actionLabel}`}</ScreenReaderOnly>
            )}
          </Text>
        </Box>
        {summary && !open && (
          <Box
            flex="0 1 auto"
            minWidth="0"
            maxWidth="50%"
            px="8px"
            py="2px"
            background={colors.teal50}
            borderRadius={bo.borderRadius}
            overflow="hidden"
          >
            <Text
              as="span"
              m="0"
              display="block"
              fontSize="xs"
              fontWeight="semi-bold"
              color="teal700"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              {summary}
            </Text>
          </Box>
        )}
        <Box
          flex="0 0 auto"
          w="28px"
          h="28px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <Icon
            name={getTrailingIcon(behaviour, open)}
            width="16px"
            height="16px"
            fill={colors.coolGrey500}
            my="0px"
          />
        </Box>
      </Box>

      {behaviour.kind === 'expand' && open && (
        <Box id={bodyId} px="12px" pb="12px">
          {behaviour.children}
        </Box>
      )}
    </Box>
  );
};

export default SetupCard;
