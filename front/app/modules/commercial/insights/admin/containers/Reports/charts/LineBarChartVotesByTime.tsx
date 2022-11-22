// libraries
import { isEmpty, map } from 'lodash-es';
import React from 'react';
import { combineLatest, Subscription } from 'rxjs';

// styling
import {
  animation,
  legacyColors,
  sizes,
} from 'components/admin/Graphs/styling';

// services
import {
  IVotesByTime,
  votesByTimeCumulativeStream,
  votesByTimeStream,
  votesByTimeXlsxEndpoint,
} from 'services/stats';

// components
import {
  GraphCard,
  GraphCardFigure,
  GraphCardFigureChange,
  GraphCardFigureContainer,
  GraphCardHeader,
  GraphCardInner,
  GraphCardTitle,
  NoDataContainer,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import { IResolution } from 'components/admin/ResolutionControl';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Label,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

type ISerie = {
  cumulatedTotal: number;
  date: string | number;
  up: number;
  down: number;
  total: number;
  code: string;
}[];

type State = {
  serie: ISerie | null;
};

type Props = {
  className?: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
  currentProjectFilterLabel?: string;
  currentGroupFilterLabel?: string;
  currentTopicFilterLabel?: string;
};

class LineBarChartVotesByTime extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  combined$: Subscription;
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
    this.combined$.unsubscribe();
  }

  convertAndMergeSeries(barSerie: IVotesByTime, lineSerie: IVotesByTime) {
    const { up, down, total } = barSerie.series;
    let convertedSerie;

    if (!isEmpty(total) && !isEmpty(lineSerie.series.total)) {
      convertedSerie = map(total, (value, key) => ({
        total: value,
        down: down[key],
        up: up[key],
        date: key,
        code: key,
        cumulatedTotal: lineSerie.series.total[key],
      }));
    } else {
      return null;
    }

    return convertedSerie;
  }

  resubscribe(
    startAt: string | null | undefined,
    endAt: string | null,
    resolution: IResolution,
    currentGroupFilter: string | undefined,
    currentTopicFilter: string | undefined,
    currentProjectFilter: string | undefined
  ) {
    if (this.combined$) {
      this.combined$.unsubscribe();
    }

    const queryParameters = {
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        project: currentProjectFilter,
        group: currentGroupFilter,
        topic: currentTopicFilter,
      },
    };

    const barStreamObservable = votesByTimeStream(queryParameters).observable;
    const lineStreamObservable =
      votesByTimeCumulativeStream(queryParameters).observable;
    this.combined$ = combineLatest([
      barStreamObservable,
      lineStreamObservable,
    ]).subscribe(([barSerie, lineSerie]) => {
      const convertedAndMergedSeries = this.convertAndMergeSeries(
        barSerie,
        lineSerie
      );
      this.setState({ serie: convertedAndMergedSeries });
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

  getFormattedNumbers(serie: ISerie | null) {
    if (serie && serie.length > 0) {
      const firstSerieValue = serie[0].cumulatedTotal;
      const lastSerieValue = serie[serie.length - 1].cumulatedTotal;
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
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const formattedNumbers = this.getFormattedNumbers(serie);
    const { className, resolution } = this.props;
    const { totalNumber, formattedSerieChange, typeOfChange } =
      formattedNumbers;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.votes} />
              <GraphCardFigureContainer>
                <GraphCardFigure>{totalNumber}</GraphCardFigure>
                <GraphCardFigureChange className={typeOfChange}>
                  {formattedSerieChange}
                </GraphCardFigureChange>
              </GraphCardFigureContainer>
            </GraphCardTitle>

            {serie && (
              <ReportExportMenu
                svgNode={this.currentChart}
                xlsx={{ endpoint: votesByTimeXlsxEndpoint }}
                name={formatMessage(messages.votes)}
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
                <CartesianGrid
                  stroke={legacyColors.cartesianGrid}
                  strokeWidth={0.5}
                />
                <XAxis
                  dataKey="date"
                  interval="preserveStartEnd"
                  stroke={legacyColors.chartLabel}
                  fontSize={sizes.chartLabel}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                  tickLine={false}
                />
                <YAxis
                  stroke={legacyColors.chartLabel}
                  fontSize={sizes.chartLabel}
                  yAxisId="cumulatedTotal"
                  tickLine={false}
                >
                  <Label
                    value={formatMessage(messages.total)}
                    angle={-90}
                    position={'center'}
                    dx={-15}
                  />
                </YAxis>
                <YAxis yAxisId="barValue" orientation="right" tickLine={false}>
                  <Label
                    value={formatMessage(messages.perPeriod, {
                      period: formatMessage(messages[resolution]),
                    })}
                    angle={90}
                    position={'center'}
                    dx={15}
                  />
                </YAxis>
                <Tooltip
                  isAnimationActive={false}
                  labelFormatter={this.formatLabel}
                />

                <Bar
                  dataKey="up"
                  name={formatMessage(messages.numberOfVotesUp)}
                  fill={legacyColors.barFill}
                  animationDuration={animation.duration}
                  animationBegin={animation.begin}
                  stackId="1"
                  yAxisId="barValue"
                  barSize={sizes.bar}
                />
                <Bar
                  dataKey="down"
                  name={formatMessage(messages.numberOfVotesDown)}
                  fill={legacyColors.barFillLighter}
                  stackId="1"
                  animationDuration={animation.duration}
                  animationBegin={animation.begin}
                  stroke="none"
                  yAxisId="barValue"
                  barSize={sizes.bar}
                />
                <Line
                  type="monotone"
                  dataKey="cumulatedTotal"
                  name={formatMessage(messages.total)}
                  dot={serie && serie?.length < 31}
                  stroke={legacyColors.line}
                  fill={legacyColors.line}
                  strokeWidth={1}
                  yAxisId="cumulatedTotal"
                />

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

export default injectIntl<Props & WrappedComponentProps>(
  LineBarChartVotesByTime
);
