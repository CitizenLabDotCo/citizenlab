import React, { useRef } from 'react';
import { isEmpty } from 'lodash-es';

// intl

// typings
import { IActiveUsersByTime } from 'api/active_users_by_time/types';

// components
import { IconTooltip, Text } from '@citizenlab/cl2-component-library';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  IGraphUnit,
  GraphCard,
  GraphCardInnerClean,
  GraphCardHeader,
  GraphCardTitle,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import { IResolution } from 'components/admin/ResolutionControl';

// utils
import { toThreeLetterMonth, toFullMonth } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';
import useActiveUsersByTime from 'api/active_users_by_time/useActiveUsersByTime';

type Props = {
  className?: string;
  graphUnit: IGraphUnit;
  graphUnitMessageKey: string;
  graphTitle: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentTopicFilter?: string | undefined;
  infoMessage?: string;
  currentProjectFilterLabel?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentTopicFilterLabel?: string | undefined;
  xlsxEndpoint: string;
};

const BarChartActiveUsersByTime = (props: Props) => {
  const currentChart = useRef();
  const { data: activeUsersByTime } = useActiveUsersByTime({
    start_at: props.startAt,
    end_at: props.endAt,
    project: props.currentProjectFilter,
    group: props.currentGroupFilter,
    topic: props.currentTopicFilter,
    interval: props.resolution,
  });

  const convertToGraphFormat = (data: IActiveUsersByTime) => {
    const { graphUnit } = props;

    if (!isEmpty(data.data.attributes.series[graphUnit])) {
      return Object.entries(data.data.attributes.series[graphUnit]).map(
        ([key, value]) => ({
          value: value as number,
          name: key,
          code: key,
        })
      );
    }

    return null;
  };

  const formatTick = (date: string) => {
    return toThreeLetterMonth(date, props.resolution);
  };

  const formatLabel = (date: string) => {
    return toFullMonth(date, props.resolution);
  };

  const serie = activeUsersByTime && convertToGraphFormat(activeUsersByTime);

  const { className, graphTitle, infoMessage } = props;

  const noData =
    isNilOrError(serie) ||
    serie.every((item) => isEmpty(item)) ||
    serie.length <= 0;

  return (
    <GraphCard className={className}>
      <GraphCardInnerClean>
        <GraphCardHeader>
          <GraphCardTitle>
            {graphTitle}
            {infoMessage && (
              <IconTooltip
                content={
                  <Text m="0px" mb="0px" fontSize="s">
                    {infoMessage}
                  </Text>
                }
                ml="8px"
                transform="translate(0,-1)"
                theme="light"
              />
            )}
          </GraphCardTitle>
          {!noData && (
            <ReportExportMenu
              svgNode={currentChart}
              name={graphTitle}
              {...props}
            />
          )}
        </GraphCardHeader>
        <BarChart
          data={serie}
          mapping={{
            category: 'name',
            length: 'value',
          }}
          innerRef={currentChart}
          xaxis={{ tickFormatter: formatTick }}
          tooltip={{ labelFormatter: formatLabel }}
        />
      </GraphCardInnerClean>
    </GraphCard>
  );
};

export default BarChartActiveUsersByTime;
