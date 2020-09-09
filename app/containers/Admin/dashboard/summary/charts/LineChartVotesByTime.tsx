// libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { map, isEmpty } from 'lodash-es';

// styling
import { withTheme } from 'styled-components';
import { rgba } from 'polished';

// services
import {
  votesByTimeStream,
  votesByTimeXlsxEndpoint,
  IVotesByTime,
} from 'services/stats';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import {
  IResolution,
  GraphCard,
  NoDataContainer,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardFigureContainer,
  GraphCardFigure,
  GraphCardFigureChange,
} from '../..';

// i18n
import messages from '../../messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

type IVotesInGraphFormat = {
  date: string | number;
  up: number;
  down: number;
  total: number;
  code: string;
}[];

type State = {
  serie: IVotesInGraphFormat | null;
};

type Props = {
  className?: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter: string | undefined;
  currentGroupFilter: string | undefined;
  currentTopicFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilterLabel: string | undefined;
};

class LineChartVotesByTime extends React.PureComponent<
  Props & InjectedIntlProps,
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
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter
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
        currentGroupFilter,
        currentTopicFilter,
        currentProjectFilter
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat(data: IVotesByTime) {
    const { up, down, total } = data.series;

    if (!isEmpty(total)) {
      const convertedData = map(total, (value, key) => ({
        total: up[key] - down[key],
        down: -down[key],
        up: up[key],
        date: key,
        code: key,
      }));
      console.log(convertedData);
      return convertedData;
    }

    return null;
  }

  resubscribe(
    startAt: string | null | undefined,
    endAt: string | null,
    resolution: IResolution,
    currentGroupFilter: string | undefined,
    currentTopicFilter: string | undefined,
    currentProjectFilter: string | undefined
  ) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = votesByTimeStream({
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
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'short',
    });
  };

  formatLabel = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  formatSerieChange = (serieChange: number) => {
    if (serieChange > 0) {
      return `(+${serieChange.toString()})`;
    } else if (serieChange < 0) {
      return `(${serieChange.toString()})`;
    }
    return null;
  };

  getFormattedNumbers(serie: IVotesInGraphFormat | null) {
    if (serie) {
      const firstSerieValue = serie && serie[0].total;
      const lastSerieValue = serie && serie[serie.length - 1].total;
      const serieChange = lastSerieValue - firstSerieValue;
      let typeOfChange: 'increase' | 'decrease' | '' = '';

      if (serieChange > 0) {
        typeOfChange = 'increase';
      } else if (serieChange < 0) {
        typeOfChange = 'decrease';
      }

      return {
        typeOfChange,
        totalNumber: lastSerieValue,
        formattedSerieChange: this.formatSerieChange(serieChange),
      };
    }

    return {
      totalNumber: null,
      formattedSerieChange: null,
      typeOfChange: '',
    };
  }

  render() {
    const {
      chartLabelSize,
      chartLabelColor,
      chartStroke,
      chartFill,
      chartStrokeGreen,
      chartStrokeRed,
      animationBegin,
      animationDuration,
    } = this.props['theme'];
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const { className } = this.props;
    const formattedNumbers = this.getFormattedNumbers(serie);
    const {
      totalNumber,
      formattedSerieChange,
      typeOfChange,
    } = formattedNumbers;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.ideaVotesByTimeTitle} />
            </GraphCardTitle>
            <GraphCardFigureContainer>
              <GraphCardFigure>{totalNumber}</GraphCardFigure>
              <GraphCardFigureChange className={typeOfChange}>
                {formattedSerieChange}
              </GraphCardFigureChange>
            </GraphCardFigureContainer>
            {serie && (
              <ExportMenu
                svgNode={this.currentChart}
                xlsxEndpoint={votesByTimeXlsxEndpoint}
                name={formatMessage(messages.ideaVotesByTimeTitle)}
                {...this.props}
              />
            )}
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <ResponsiveContainer>
              <ComposedChart
                data={serie}
                margin={{ right: 40 }}
                ref={this.currentChart}
              >
                {/* <defs>
                    <linearGradient id="down" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="red" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="red" stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="up" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.5} />
                    </linearGradient>

                  </defs> */}
                <CartesianGrid stroke="#f5f5f5" strokeWidth={0.5} />
                <XAxis
                  dataKey="date"
                  interval="preserveStartEnd"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                />
                <YAxis stroke={chartLabelColor} fontSize={chartLabelSize} />
                <Tooltip
                  isAnimationActive={false}
                  labelFormatter={this.formatLabel}
                />
                {/* <ReferenceLine y={0} stroke='#000' /> */}
                <Bar
                  dataKey="up"
                  name={formatMessage(messages.numberOfVotesUp)}
                  dot={false}
                  fill={rgba(chartStrokeGreen, 0.4)}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  stackId="1"
                />
                <Bar
                  dataKey={'down'}
                  name={formatMessage(messages.numberOfVotesDown)}
                  dot={false}
                  fill={rgba(chartStrokeRed, 0.4)}
                  stackId="1"
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  stroke="none"
                />

                {/* <CartesianGrid strokeDasharray="5 5" /> */}
                {/* <Bar
                  type="step"
                  dataKey="total"
                  name={formatMessage(messages.numberOfVotesTotal)}
                  dot={false}
                  fill={rgba(chartFill, 0.1)}
                  stroke={chartStroke}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                /> */}
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(LineChartVotesByTime as any) as any);
