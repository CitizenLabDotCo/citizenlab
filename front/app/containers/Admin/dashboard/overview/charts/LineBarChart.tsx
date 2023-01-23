import React from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { map, isEmpty } from 'lodash-es';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../../messages';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import {
  IResourceByTime,
  IVotesByTime,
  IUsersByTime,
  IIdeasByTime,
  ICommentsByTime,
} from 'services/stats';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  ComposedChart,
  CartesianGrid,
  Tooltip,
  Line,
  Legend,
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from 'recharts';
import {
  IGraphUnit,
  GraphCard,
  NoDataContainer,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
  GraphCardFigureContainer,
  GraphCardFigure,
  GraphCardFigureChange,
} from 'components/admin/GraphWrappers';
import { Popup } from 'semantic-ui-react';
import { Icon } from '@citizenlab/cl2-component-library';
import { IResolution } from 'components/admin/ResolutionControl';
import { isNilOrError } from 'utils/helperUtils';

// styling
import styled from 'styled-components';
import { legacyColors, sizes } from 'components/admin/Graphs/styling';

// utils
import { toThreeLetterMonth, toFullMonth } from 'utils/dateUtils';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 10px;
`;

const StyledResponsiveContainer = styled(ResponsiveContainer)`
  .recharts-wrapper {
    @media print {
      margin: 0 auto;
    }
  }
`;

type IComposedGraphFormat = {
  total: number | string;
  name: string;
  code: string;
  barValue: number | string;
}[];

interface State {
  serie: IComposedGraphFormat | undefined;
}

type IStreams =
  | IStream<IUsersByTime>
  | IStream<IIdeasByTime>
  | IStream<ICommentsByTime>
  | IStream<IVotesByTime>;

interface Props {
  className?: string;
  graphUnit: IGraphUnit;
  graphUnitMessageKey: string;
  graphTitle: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
  barStream: (streamParams: IStreamParams | null) => IStreams;
  lineStream: (streamParams: IStreamParams | null) => IStreams;
  infoMessage?: string;
  currentProjectFilterLabel?: string;
  currentGroupFilterLabel?: string;
  currentTopicFilterLabel?: string;
  xlsxEndpoint: string;
}
class LineBarChart extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  combined$: Subscription;
  currentChart: React.RefObject<any>;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      serie: undefined,
    };

    this.currentChart = React.createRef();
  }

  componentDidMount() {
    this.resubscribe();
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
      this.resubscribe();
    }
  }

  componentWillUnmount() {
    this.combined$.unsubscribe();
  }

  convertAndMergeSeries = (
    barSerie: IResourceByTime,
    lineSerie: IResourceByTime
  ) => {
    const { graphUnit } = this.props;
    let convertedSerie;

    if (
      !isEmpty(lineSerie.series[graphUnit]) &&
      !isEmpty(barSerie.series[graphUnit])
    ) {
      convertedSerie = map(lineSerie.series[graphUnit], (value, key) => ({
        total: value,
        barValue: barSerie.series[graphUnit][key],
        name: key,
        code: key,
      }));
    } else {
      return undefined;
    }

    return convertedSerie;
  };

  resubscribe() {
    const {
      barStream,
      lineStream,
      startAt,
      endAt,
      resolution,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter,
    } = this.props;

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

    const barStreamObservable = barStream(queryParameters).observable;
    const lineStreamObservable = lineStream(queryParameters).observable;
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
    return toThreeLetterMonth(date, this.props.resolution);
  };

  formatLabel = (date: string) => {
    return toFullMonth(date, this.props.resolution);
  };

  formatSerieChange = (serieChange: number) => {
    if (serieChange > 0) {
      return `(+${serieChange.toString()})`;
    } else if (serieChange < 0) {
      return `(${serieChange.toString()})`;
    }
    return null;
  };

  getFormattedNumbers(serie) {
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
    const { formatMessage } = this.props.intl;
    const { className, graphTitle, infoMessage, resolution } = this.props;
    const { serie } = this.state;

    const formattedNumbers = this.getFormattedNumbers(serie);
    const { totalNumber, formattedSerieChange, typeOfChange } =
      formattedNumbers;

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

              <GraphCardFigureContainer>
                <GraphCardFigure>{totalNumber}</GraphCardFigure>
                <GraphCardFigureChange className={typeOfChange}>
                  {formattedSerieChange}
                </GraphCardFigureChange>
              </GraphCardFigureContainer>
            </GraphCardTitle>

            {!noData && (
              <ReportExportMenu
                svgNode={this.currentChart}
                name={graphTitle}
                {...this.props}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <StyledResponsiveContainer>
              <ComposedChart
                data={serie}
                reverseStackOrder={true}
                ref={this.currentChart}
              >
                <CartesianGrid
                  stroke={legacyColors.cartesianGrid}
                  strokeWidth={0.5}
                />
                <XAxis
                  dataKey="name"
                  interval="preserveStartEnd"
                  stroke={legacyColors.chartLabel}
                  fontSize={sizes.chartLabel}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="total"
                  stroke={legacyColors.chartLabel}
                  fontSize={sizes.chartLabel}
                  tickLine={false}
                >
                  <Label
                    value={formatMessage(messages.total)}
                    angle={-90}
                    position={'center'}
                    dx={-15}
                  />
                </YAxis>
                <YAxis
                  yAxisId="barValue"
                  orientation="right"
                  allowDecimals={false}
                  tickLine={false}
                >
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
                  cursor={{ strokeWidth: 1 }}
                />

                <Bar
                  dataKey="barValue"
                  yAxisId="barValue"
                  barSize={sizes.bar}
                  fill={legacyColors.barFill}
                  fillOpacity={1}
                  name={formatMessage(messages.totalForPeriod, {
                    period: formatMessage(messages[resolution]),
                  })}
                />
                <Line
                  type="monotone"
                  yAxisId="total"
                  dataKey="total"
                  activeDot={Boolean(serie && serie?.length < 31)}
                  stroke={legacyColors.line}
                  fill={legacyColors.line}
                  strokeWidth={1}
                  name={formatMessage(messages.total)}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px',
                  }}
                />
              </ComposedChart>
            </StyledResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props & WrappedComponentProps>(LineBarChart);
