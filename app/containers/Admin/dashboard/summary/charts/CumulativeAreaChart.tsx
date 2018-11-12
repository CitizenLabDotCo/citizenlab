import React from 'react';
import { Subscription } from 'rxjs';
import { map, isNumber, isEmpty } from 'lodash-es';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { AreaChart, CartesianGrid, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import messages from '../../messages';
import { rgba } from 'polished';

// components
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeader, GraphCardTitle, GraphCardFigureContainer, GraphCardFigure, GraphCardFigureChange } from '../..';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByTime, IIdeasByTime, ICommentsByTime } from 'services/stats';

type State = {
  serie: {
    name: string | number,
    value: number,
    code: string
  }[] | null;
};

type Props = {
  className?: string;
  graphUnit: 'ActiveUsers' | 'Users' | 'Ideas' | 'Comments' | 'Votes';
  graphTitleMessageKey: string;
  startAt: string;
  endAt: string;
  resolution: 'month' | 'day';
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByTime | IIdeasByTime | ICommentsByTime>;
};

class CumulativeAreaChart extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.state = {
      serie: null,
    };
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
      currentProjectFilter,
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

    if (startAt !== prevProps.startAt
      || endAt !== prevProps.endAt
      || resolution !== prevProps.resolution
      || currentGroupFilter !== prevProps.currentGroupFilter
      || currentTopicFilter !== prevProps.currentTopicFilter
      || currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(
        startAt,
        endAt,
        resolution,
        currentGroupFilter,
        currentTopicFilter,
        currentProjectFilter,
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (serie: { [key: string]: number }) => {
    return map(serie, (value, key) => ({
      value,
      name: key,
      code: key
    }));
  }

  resubscribe(
    startAt: string,
    endAt: string,
    resolution: 'month' | 'day',
    currentGroupFilter: string | null,
    currentTopicFilter: string | null,
    currentProjectFilter: string | null,
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
      }
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie);
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: (resolution === 'month' ? undefined : '2-digit'),
      month: 'short',
    });
  }

  formatLabel = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: (resolution === 'month' ? undefined : '2-digit'),
      month: 'long',
      year: 'numeric'
    });
  }

  formatSerieChange = (serieChange: number) => {
    if (serieChange > 0) {
      return `(+${serieChange.toString()})`;
    } else if (serieChange < 0) {
      return `(${serieChange.toString()})`;
    }
    return;
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { graphTitleMessageKey, graphUnit, className } = this.props;
    const { serie } = this.state;
    const noData = serie && serie.every(item => isEmpty(item));
    const { chartFill, chartLabelSize, chartLabelColor, chartStroke } = this.props['theme'];
    const firstSerieValue = serie && serie[0].value;
    const lastSerieValue = serie && serie[serie.length - 1].value;
    const serieChange = isNumber(firstSerieValue) && isNumber(lastSerieValue) && (lastSerieValue - firstSerieValue);
    const formattedSerieChange = isNumber(serieChange) ? this.formatSerieChange(serieChange) : null;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
            </GraphCardTitle>
            <GraphCardFigureContainer>
              <GraphCardFigure>
                {lastSerieValue}
              </GraphCardFigure>
              <GraphCardFigureChange
                className={
                  isNumber(serieChange) && serieChange > 0 ? 'increase' : 'decrease'
                }
              >
                {formattedSerieChange}
              </GraphCardFigureChange>
            </GraphCardFigureContainer>
          </GraphCardHeader>
          {noData ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
            <ResponsiveContainer>
              <AreaChart data={serie} margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="5 5" />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={formatMessage(messages[`numberOf${graphUnit}`])}
                  dot={false}
                  fill={rgba(chartFill, .25)}
                  fillOpacity={1}
                  stroke={chartStroke}
                />
                <XAxis
                  dataKey="name"
                  interval="preserveStartEnd"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                />
                <YAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                />
                <Tooltip
                  isAnimationActive={false}
                  labelFormatter={this.formatLabel}
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(CumulativeAreaChart as any) as any);
