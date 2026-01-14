import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import { TooltipContentProps } from 'recharts/types/component/Tooltip';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';
import { colors } from 'components/admin/Graphs/styling';
import { IResolution } from 'components/admin/ResolutionControl';

import { FormattedMessage } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import messages from './messages';

type CustomTooltipProps = {
  label: TooltipContentProps<string, string>['label'];
  payload?:
    | [
        {
          payload?: {
            participants: number;
            visitors?: number;
            date: string;
          };
        }
      ]
    | [];
  resolution: IResolution;
  showVisitors?: boolean;
};

const CustomTooltip = ({
  label,
  payload,
  resolution,
  showVisitors = false,
}: CustomTooltipProps) => {
  if (!payload?.[0]?.payload || !label) return null;

  const data = payload[0].payload;

  return (
    <TooltipOutline label={toFullMonth(String(label), resolution)}>
      <Box py="0px">
        <Icon
          name="dot"
          width="8px"
          height="8px"
          fill={colors.categorical01}
          mr="6px"
          mt="-2px"
        />
        <FormattedMessage {...messages.participants} />: {data.participants}
      </Box>
      {showVisitors && data.visitors !== undefined && (
        <Box py="0px">
          <Icon
            name="dot"
            width="8px"
            height="8px"
            fill={colors.categorical03}
            mr="6px"
            mt="-2px"
          />
          <FormattedMessage {...messages.visitors} />: {data.visitors}
        </Box>
      )}
    </TooltipOutline>
  );
};

const renderTooltip =
  (resolution: IResolution, showVisitors = false) =>
  (props) =>
    (
      <Tooltip
        {...props}
        cursor={{ stroke: colors.gridHoverColor }}
        content={(props) => (
          <CustomTooltip
            label={props.label}
            payload={props.payload as any}
            resolution={resolution}
            showVisitors={showVisitors}
          />
        )}
      />
    );

export default renderTooltip;
