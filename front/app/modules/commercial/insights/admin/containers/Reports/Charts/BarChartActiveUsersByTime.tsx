// libraries
import React, { useRef } from 'react';
import { map, isEmpty } from 'lodash-es';

// intl
import { useIntl } from 'utils/cl-intl';

// typings

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  IGraphUnit,
  GraphCard,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import { IResolution } from 'components/admin/ResolutionControl';
import { Popup } from 'semantic-ui-react';
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

import { isNilOrError } from 'utils/helperUtils';
import useActiveUsersByTime from 'api/active_users_by_time/useActiveUsersByTime';
import { IActiveUsersByTime } from 'api/active_users_by_time/types';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;
`;

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
  const { formatDate } = useIntl();
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
      return map(data.data.attributes.series[graphUnit], (value, key) => ({
        value,
        name: key,
        code: key,
      }));
    }

    return null;
  };

  const formatTick = (date: string) => {
    const { resolution } = props;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'short',
    });
  };

  const formatLabel = (date: string) => {
    const { resolution } = props;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const { className, graphTitle, infoMessage } = props;
  const serie = activeUsersByTime && convertToGraphFormat(activeUsersByTime);

  const noData =
    isNilOrError(serie) ||
    serie.every((item) => isEmpty(item)) ||
    serie.length <= 0;

  return (
    <GraphCard className={className}>
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            {graphTitle}
            {infoMessage && (
              <Popup
                basic
                trigger={
                  <div>
                    <InfoIcon name="info-outline" />
                  </div>
                }
                content={infoMessage}
                position="top left"
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
          bars={{ name: graphTitle }}
          innerRef={currentChart}
          xaxis={{ tickFormatter: formatTick }}
          tooltip={{ labelFormatter: formatLabel }}
        />
      </GraphCardInner>
    </GraphCard>
  );
};

export default BarChartActiveUsersByTime;
