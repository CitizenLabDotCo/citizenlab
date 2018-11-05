import React from 'react';
import { Subscription } from 'rxjs';
import { map } from 'lodash-es';
import { withTheme } from 'styled-components';
import { LineChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { votesByTimeCumulativeStream, IVotesByTimeCumulative } from 'services/stats';
import messages from '../messages';
import EmptyGraph from './EmptyGraph';
import { GraphCard, GraphCardInner, GraphCardTitle } from '../';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

type State = {
  serie: {
    date: string | number,
    up: number, down: number,
    total: number, code: string
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
        group: currentGroupFilter,
        topic: currentTopicFilter,
        project: currentProjectFilter
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

  render() {
    const { chartLabelSize, chartLabelColor, chartStroke, chartStrokeGreen, chartStrokeRed } = this.props['theme'];
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const { className } = this.props;
    const isEmpty = !serie || serie.every(item => (item.up === 0) && (item.down === 0) && (item.total === 0));

    if (!isEmpty) {
      return (
        <GraphCard className={className}>
          <GraphCardInner>
            <GraphCardTitle>
              <FormattedMessage {...messages.votesByTimeTitle} />
            </GraphCardTitle>
            <ResponsiveContainer>
              <LineChart data={serie} margin={{ right: 40 }}>
                <CartesianGrid strokeDasharray="5 5" />
                <Line
                  type="monotone"
                  dataKey="up"
                  name={formatMessage(messages.numberOfVotesUp)}
                  dot={false}
                  stroke={chartStrokeGreen}
                />
                <Line
                  type="monotone"
                  dataKey="down"
                  name={formatMessage(messages.numberOfVotesDown)}
                  dot={false}
                  stroke={chartStrokeRed}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  name={formatMessage(messages.numberOfVotesTotal)}
                  dot={false}
                  stroke={chartStroke}
                />
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
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </GraphCardInner>
        </GraphCard>
      );
    } else {
      return (
        <EmptyGraph unit="Votes" />
      );
    }
  }
}

export default injectIntl<Props>(withTheme(LineChartVotesByTime as any) as any);
