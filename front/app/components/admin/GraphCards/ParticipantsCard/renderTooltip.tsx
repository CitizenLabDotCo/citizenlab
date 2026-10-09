import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import { TooltipContentProps } from 'recharts/types/component/Tooltip';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';
import { colors } from 'components/admin/Graphs/styling';
import { IResolution } from 'components/admin/ResolutionControl';

import { FormattedMessage } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import { SERIES, SeriesKey } from './series';

type CustomTooltipProps = {
  label: TooltipContentProps<string, string>['label'];
  payload?:
    | [
        {
          payload?: {
            participants?: number;
            visitors?: number;
            date: string;
          };
        }
      ]
    | [];
  resolution: IResolution;
  series: SeriesKey[];
};

const CustomTooltip = ({
  label,
  payload,
  resolution,
  series,
}: CustomTooltipProps) => {
  if (!payload?.[0]?.payload || !label) return null;

  const data = payload[0].payload;

  return (
    <TooltipOutline label={toFullMonth(String(label), resolution)}>
      {series.map((key) =>
        data[key] === undefined ? null : (
          <Box key={key} py="0px">
            <Icon
              name="dot"
              width="8px"
              height="8px"
              fill={SERIES[key].color}
              mr="6px"
              mt="-2px"
            />
            <FormattedMessage {...SERIES[key].label} />: {data[key]}
          </Box>
        )
      )}
    </TooltipOutline>
  );
};

const renderTooltip =
  (resolution: IResolution, series: SeriesKey[]) => (props) =>
    (
      <Tooltip
        {...props}
        cursor={{ stroke: colors.gridHoverColor }}
        content={(props) => (
          <CustomTooltip
            label={props.label}
            payload={props.payload as any}
            resolution={resolution}
            series={series}
          />
        )}
      />
    );

export default renderTooltip;
