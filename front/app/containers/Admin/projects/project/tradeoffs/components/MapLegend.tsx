import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { RELATION_COLOR } from '../utils/display';

const Line = ({ color, dashed }: { color: string; dashed?: boolean }) => (
  <svg width="28" height="10" aria-hidden>
    <line
      x1="1"
      y1="5"
      x2="27"
      y2="5"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeDasharray={dashed ? '5 4' : undefined}
    />
  </svg>
);

const Dot = ({
  fill,
  stroke,
  dashed,
}: {
  fill: string;
  stroke: string;
  dashed?: boolean;
}) => (
  <svg width="16" height="16" aria-hidden>
    <circle
      cx="8"
      cy="8"
      r="6"
      fill={fill}
      stroke={stroke}
      strokeWidth="2"
      strokeDasharray={dashed ? '3 2' : undefined}
    />
  </svg>
);

const Item = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: React.ReactNode;
}) => (
  <Box display="flex" alignItems="center" gap="6px">
    {children}
    <Text m="0" fontSize="xs" color="textSecondary">
      {label}
    </Text>
  </Box>
);

const MapLegend = () => (
  <Box display="flex" flexWrap="wrap" gap="16px" alignItems="center">
    <Item label={<FormattedMessage {...messages.legendExclusive} />}>
      <Line color={RELATION_COLOR.exclusive} />
    </Item>
    <Item label={<FormattedMessage {...messages.legendAdditive} />}>
      <Line color={RELATION_COLOR.additive} />
    </Item>
    <Item label={<FormattedMessage {...messages.legendUnconfirmed} />}>
      <Line color={colors.grey600} dashed />
    </Item>
    <Item label={<FormattedMessage {...messages.legendSelected} />}>
      <Dot fill={colors.primary} stroke={colors.primary} />
    </Item>
    <Item label={<FormattedMessage {...messages.legendBlocked} />}>
      <Dot fill={colors.red100} stroke={colors.red500} dashed />
    </Item>
    <Item label={<FormattedMessage {...messages.legendSize} />}>
      <Box display="flex" alignItems="center" gap="2px">
        <Dot fill={colors.white} stroke={colors.grey500} />
        <svg width="22" height="22" aria-hidden>
          <circle
            cx="11"
            cy="11"
            r="9"
            fill={colors.white}
            stroke={colors.grey500}
            strokeWidth="2"
          />
        </svg>
      </Box>
    </Item>
  </Box>
);

export default MapLegend;
