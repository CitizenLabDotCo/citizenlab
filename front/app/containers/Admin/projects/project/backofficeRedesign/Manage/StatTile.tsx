import React from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';

type Tone = 'neutral' | 'warning' | 'success';

const TONES: Record<
  Tone,
  { background: string; border: string; number: string }
> = {
  neutral: {
    background: colors.white,
    border: colors.grey300,
    number: colors.textPrimary,
  },
  warning: {
    background: colors.orange100,
    border: colors.orange100,
    number: colors.orange500,
  },
  success: {
    background: colors.green100,
    border: colors.green100,
    number: colors.green700,
  },
};

interface Props {
  value: number;
  label: string;
  tone?: Tone;
  tooltip?: string;
  active?: boolean;
  onClick?: () => void;
}

const StatTile = ({
  value,
  label,
  tone = 'neutral',
  tooltip,
  active = false,
  onClick,
}: Props) => {
  const { background, border, number } = TONES[tone];

  const content = (
    <>
      <Text m="0" fontSize="l" fontWeight="bold" style={{ color: number }}>
        {value}
      </Text>
      <Text m="0" fontSize="s" color="textSecondary">
        {label}
      </Text>
    </>
  );
  const tileProps = {
    w: '100%',
    p: '12px',
    borderRadius: stylingConsts.borderRadius,
    border: `${active ? 2 : 1}px solid ${active ? number : border}`,
    bgColor: background,
  };

  return (
    <Box flex="1 1 0">
      <Tooltip content={tooltip} disabled={!tooltip} placement="top">
        {onClick ? (
          <Box
            as="button"
            type="button"
            aria-pressed={active}
            onClick={onClick}
            style={{ cursor: 'pointer', textAlign: 'left' }}
            {...tileProps}
          >
            {content}
          </Box>
        ) : (
          <Box {...tileProps}>{content}</Box>
        )}
      </Tooltip>
    </Box>
  );
};

export default StatTile;
