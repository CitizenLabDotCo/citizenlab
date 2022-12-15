import React from 'react';
import { Subscription } from 'rxjs';
import { isEmpty } from 'lodash-es';

// intl
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IResourceByTime, IUsersByTime } from 'services/stats';

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

type Row = { name: string; code: string; value: number };

type State = {
  serie: Row[] | null;
};

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
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByTime>;
  infoMessage?: string;
  currentProjectFilterLabel?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentTopicFilterLabel?: string | undefined;
  xlsxEndpoint: string;
};

class BarChartActiveUsersByTime extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  subscription: Subscription;
  currentChart: React.RefObject<any>;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };

    this.currentChart = React.createRef();
  }

  componentDidMount() {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;
    this.resubscribe(
      startAt,
      endAt,
      resolution,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter
    );
  }

  componentDidUpdate(prevProps: Props) {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;

    if (
      startAt !== prevProps.startAt ||
      endAt !== prevProps.endAt ||
      resolution !== prevProps.resolution ||
      currentGroupFilter !== prevProps.currentGroupFilter ||
      currentTopicFilter !== prevProps.currentTopicFilter ||
      currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(
        startAt,
        endAt,
        resolution,
        currentProjectFilter,
        currentGroupFilter,
        currentTopicFilter
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (data: IResourceByTime) => {
    const { graphUnit } = this.props;

    if (!isEmpty(data.series[graphUnit])) {
      return Object.entries(data.series[graphUnit]).map(([key, value]) => ({
        value: value as number,
        name: key,
        code: key,
      }));
    }

    return null;
  };

  resubscribe(
    startAt: string | null | undefined,
    endAt: string | null,
    resolution: IResolution,
    currentProjectFilter: string | undefined,
    currentGroupFilter: string | undefined,
    currentTopicFilter: string | undefined
  ) {
    const { stream } = this.props;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = stream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        project: currentProjectFilter,
        group: currentGroupFilter,
        topic: currentTopicFilter,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie);
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date: string) => {
    return toThreeLetterMonth(date, this.props.resolution);
  };

  formatLabel = (date: string) => {
    return toFullMonth(date, this.props.resolution);
  };

  render() {
    const { className, graphTitle, infoMessage } = this.props;
    const { serie } = this.state;

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
                svgNode={this.currentChart}
                name={graphTitle}
                {...this.props}
              />
            )}
          </GraphCardHeader>
          <BarChart
            data={serie}
            mapping={{
              category: 'name',
              length: 'value',
            }}
            innerRef={this.currentChart}
            xaxis={{ tickFormatter: this.formatTick }}
            tooltip={{ labelFormatter: this.formatLabel }}
          />
        </GraphCardInnerClean>
      </GraphCard>
    );
  }
}

export default injectIntl<Props & WrappedComponentProps>(
  BarChartActiveUsersByTime
);
