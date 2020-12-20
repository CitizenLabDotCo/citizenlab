// libraries
import React from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { map, isEmpty } from 'lodash-es';

// styling
import { withTheme } from 'styled-components';
import { rgba } from 'polished';

// services
import {
  votesByTimeStream,
  votesByTimeCumulativeStream,
  votesByTimeXlsxEndpoint,
  IVotesByTime,
} from 'services/stats';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  Line,
  Label,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
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
  Props & InjectedIntlProps,
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
    const lineStreamObservable = votesByTimeCumulativeStream(queryParameters)
      .observable;
    this.combined$ = combineLatest(
      barStreamObservable,
      lineStreamObservable
    ).subscribe(([barSerie, lineSerie]) => {
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
    const {
      chartLabelSize,
      chartLabelColor,
      newLineColor,
      animationBegin,
      animationDuration,
      cartesianGridColor,
      newBarFill,
    } = this.props['theme'];
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const formattedNumbers = this.getFormattedNumbers(serie);
    const { className, resolution } = this.props;
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
              <FormattedMessage {...messages.votes} />
              <GraphCardFigureContainer>
                <GraphCardFigure>{totalNumber}</GraphCardFigure>
                <GraphCardFigureChange className={typeOfChange}>
                  {formattedSerieChange}
                </GraphCardFigureChange>
              </GraphCardFigureContainer>
            </GraphCardTitle>

            {serie && (
              <ExportMenu
                svgNode={this.currentChart}
                xlsxEndpoint={votesByTimeXlsxEndpoint}
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
                <CartesianGrid stroke={cartesianGridColor} strokeWidth={0.5} />
                <XAxis
                  dataKey="date"
                  interval="preserveStartEnd"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                  tickLine={false}
                />
                <YAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
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
                  dot={false}
                  fill={rgba(newBarFill, 1)}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  stackId="1"
                  yAxisId="barValue"
                  barSize={20}
                />
                <Bar
                  dataKey="down"
                  name={formatMessage(messages.numberOfVotesDown)}
                  dot={false}
                  fill={rgba(newBarFill, 0.7)}
                  stackId="1"
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  stroke="none"
                  yAxisId="barValue"
                  barSize={20}
                />
                <Line
                  type="monotone"
                  dataKey="cumulatedTotal"
                  name={formatMessage(messages.total)}
                  dot={serie && serie?.length < 31}
                  stroke={newLineColor}
                  fill={newLineColor}
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

export default injectIntl<Props>(
  withTheme(LineBarChartVotesByTime as any) as any
);
