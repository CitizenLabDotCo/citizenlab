// libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { map, merge, isEmpty } from 'lodash-es';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import {
  IResourceByTime,
  IUsersByTime,
  IIdeasByTime,
  ICommentsByTime,
} from 'services/stats';
import { IGraphFormat } from 'typings';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  ComposedChart,
  CartesianGrid,
  Tooltip,
  Line,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  IGraphUnit,
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
import { Popup } from 'semantic-ui-react';
import { Icon } from 'cl2-component-library';

// styling
import styled, { withTheme } from 'styled-components';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  height: 22px;
  margin-left: 10px;
`;

const StyledResponsiveContainer = styled(ResponsiveContainer)`
  .recharts-wrapper {
    @media print {
      margin: 0 auto;
    }
  }
`;

type State = {
  serie: IGraphFormat | null;
  serie2: IGraphFormat | null;
};

type Props = {
  className?: string;
  graphUnit: IGraphUnit;
  graphUnitMessageKey: string;
  graphTitleMessageKey: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter: string | undefined;
  currentGroupFilter: string | undefined;
  currentTopicFilter: string | undefined;
  stream: (
    streamParams?: IStreamParams | null
  ) => IStream<IUsersByTime> | IStream<IIdeasByTime> | IStream<ICommentsByTime>;
  stream2: (
    streamParams?: IStreamParams | null
  ) => IStream<IUsersByTime> | IStream<IIdeasByTime> | IStream<ICommentsByTime>;
  infoMessage?: string;
  currentProjectFilterLabel: string | undefined;
  currentGroupFilterLabel: string | undefined;
  currentTopicFilterLabel: string | undefined;
  xlsxEndpoint: string;
};

class LineBarChart extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  barStreamSubscription: Subscription;
  lineStreamSubscription: Subscription;
  currentChart: React.RefObject<any>;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
      serie2: null,
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
    this.barStreamSubscription.unsubscribe();
    this.lineStreamSubscription.unsubscribe();
  }

  convertToGraphFormat = (data: IResourceByTime) => {
    const { graphUnit } = this.props;

    if (!isEmpty(data.series[graphUnit])) {
      const convertedSerie = map(data.series[graphUnit], (value, key) => ({
        total: value,
        name: key,
        code: key,
      }));

      console.log('convertedSerie', convertedSerie);

      return convertedSerie;
    }

    return null;
  };

  convertDataForBar = (data: IResourceByTime) => {
    const { graphUnit } = this.props;

    if (!isEmpty(data.series[graphUnit])) {
      const convertedSerie = map(data.series[graphUnit], (value, key) => ({
        barValue: value,
        name: key,
        code: key,
      }));

      console.log('convertedSerie', convertedSerie);

      return convertedSerie;
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
    const { stream, stream2 } = this.props;

    if (this.barStreamSubscription) {
      this.barStreamSubscription.unsubscribe();
    }
    if (this.lineStreamSubscription) {
      this.lineStreamSubscription.unsubscribe();
    }

    this.barStreamSubscription = stream({
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

    this.lineStreamSubscription = stream2({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        project: currentProjectFilter,
        group: currentGroupFilter,
        topic: currentTopicFilter,
      },
    }).observable.subscribe((serie2) => {
      const convertedSerie = this.convertDataForBar(serie2);
      this.setState({ serie2: convertedSerie });
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

  getFormattedNumbers(serie: IGraphFormat | null) {
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
    const {
      className,
      graphTitleMessageKey,
      graphUnitMessageKey,
      infoMessage,
    } = this.props;
    const { serie, serie2 } = this.state;
    merge(serie, serie2);

    const {
      chartFill,
      chartLabelSize,
      chartLabelColor,
      barHoverColor,
      animationBegin,
      animationDuration,
    } = this.props['theme'];

    const formattedNumbers = this.getFormattedNumbers(serie);
    const {
      totalNumber,
      formattedSerieChange,
      typeOfChange,
    } = formattedNumbers;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
              {/* {infoMessage && (
                <Popup
                  basic
                  trigger={
                    <div>
                      <InfoIcon name="info" />
                    </div>
                  }
                  content={infoMessage}
                  position="top left"
                />
              )} */}
            </GraphCardTitle>
            <GraphCardFigureContainer>
              <GraphCardFigure>{totalNumber}</GraphCardFigure>
              <GraphCardFigureChange className={typeOfChange}>
                {formattedSerieChange}
              </GraphCardFigureChange>
            </GraphCardFigureContainer>
            {!noData && (
              <ExportMenu
                svgNode={this.currentChart}
                name={formatMessage(messages[graphTitleMessageKey])}
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
                margin={{ right: 40 }}
                ref={this.currentChart}
              >
                <CartesianGrid stroke="#f5f5f5" strokeWidth={0.5} />
                <XAxis
                  dataKey="name"
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
                  cursor={{ strokeWidth: 1 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={chartFill}
                  dot={false}
                  name="Total cumulé"
                />
                <Bar
                  dataKey="barValue"
                  barSize={20}
                  fill={chartFill}
                  fillOpacity={0.5}
                  name="Sur la période"
                />
              </ComposedChart>
            </StyledResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(LineBarChart as any) as any);
