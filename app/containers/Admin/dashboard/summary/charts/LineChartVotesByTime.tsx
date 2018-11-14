import React from 'react';
import { Subscription } from 'rxjs';
import { map, isNumber, isEmpty } from 'lodash-es';
import { withTheme } from 'styled-components';
import { LineChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { votesByTimeCumulativeStream, IVotesByTimeCumulative } from 'services/stats';
import messages from '../../messages';
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeader, GraphCardTitle, GraphCardFigureContainer, GraphCardFigure, GraphCardFigureChange } from '../..';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

type State = {
  serie: {
    date: string | number,
    up: number,
    down: number,
    total: number,
    code: string
  }[] | null;
};

type Props = {
  className: string;
  startAt: string;
  endAt: string;
  resolution: 'month' | 'day';
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
};

class LineChartVotesByTime extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null
    };
  }

  componentDidMount() {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter
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
      currentProjectFilter
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
        currentProjectFilter
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat(serie: IVotesByTimeCumulative) {
    const { up, down, total } = serie;

    return map(total, (value, key) => ({
      total: value,
      down: down[key],
      up: up[key],
      date: key,
      code: key
    }));
  }

  resubscribe(
    startAt: string,
    endAt: string,
    resolution: 'month' | 'day',
    currentGroupFilter: string | null,
    currentTopicFilter: string | null,
    currentProjectFilter: string | null
  ) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = votesByTimeCumulativeStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        project: currentProjectFilter,
        group: currentGroupFilter,
        topic: currentTopicFilter,
      }
    }).observable.subscribe((serie) => {
      const validSerie = !isEmpty(serie.down) && !isEmpty(serie.up) && !isEmpty(serie.total);
      const convertedSerie = validSerie ? this.convertToGraphFormat(serie) : null;
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: (resolution === 'month' ? undefined : '2-digit'),
      month: 'short'
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
    return null;
  }

  render() {
    const { chartLabelSize, chartLabelColor, chartStroke, chartStrokeGreen, chartStrokeRed } = this.props['theme'];
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const { className } = this.props;
    const noData = !serie;
    const firstSerieValue = serie && serie[0].total;
    const lastSerieValue = serie && serie[serie.length - 1].total;
    const serieChange = isNumber(firstSerieValue) && isNumber(lastSerieValue) && (lastSerieValue - firstSerieValue);
    const formattedSerieChange = isNumber(serieChange) ? this.formatSerieChange(serieChange) : null;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.votesByTimeTitle} />
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
              <LineChart data={serie} margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="5 5" />
                <XAxis
                  dataKey="date"
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
                <Line
                  type="monotone"
                  dataKey="up"
                  name={formatMessage(messages.numberOfVotesUp)}
                  dot={false}
                  fill={chartStrokeGreen}
                  stroke={chartStrokeGreen}
                />
                <Line
                  type="monotone"
                  dataKey="down"
                  name={formatMessage(messages.numberOfVotesDown)}
                  dot={false}
                  fill={chartStrokeRed}
                  stroke={chartStrokeRed}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name={formatMessage(messages.numberOfVotesTotal)}
                  dot={false}
                  fill={chartStroke}
                  stroke={chartStroke}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(LineChartVotesByTime as any) as any);
