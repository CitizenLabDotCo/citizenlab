import React from 'react';
import { Subscription } from 'rxjs';
import { map } from 'lodash-es';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { votesByTimeCumulativeStream } from 'services/stats';
import messages from '../messages';
import EmptyGraph from './EmptyGraph';

type State = {
  serie: { name: string | number, value: number, code: string }[] | null;
};

type Props = {
  startAt: string,
  endAt: string,
  resolution: 'month' | 'day',
  currentProjectFilter?: string;
  currentGroupFilter?: string;
  currentTopicFilter?: string;
};

class CommentsByTimeChart extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null
    };
  }

  componentDidMount() {
    const { startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter } = this.props;
    this.resubscribe(startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter);
  }

  componentDidUpdate(prevProps: Props) {
    const { startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter } = this.props;

    if (startAt !== prevProps.startAt
      || endAt !== prevProps.endAt
      || resolution !== prevProps.resolution
      || currentGroupFilter !== prevProps.currentGroupFilter
      || currentTopicFilter !== prevProps.currentTopicFilter
      || currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter);
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat(serie: { [key: string]: number }) {
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
    currentGroupFilter?: string,
    currentTopicFilter?: string,
    currentProjectFilter?: string
  ) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = votesByTimeCumulativeStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        // current_group_filter: currentGroupFilter, TODO
        // current_topic_filter: currentTopicFilter, TODO
        // current_project_filter: currentProjectFilter, TODO
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
    const { chartFill, chartLabelSize, chartLabelColor, chartStroke } = this.props['theme'];
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const isEmpty = !serie || serie.every(item => item.value === 0);

    if (!isEmpty) {
      return (
        <ResponsiveContainer>
          <AreaChart data={serie} margin={{ right: 40 }}>
            <Area
              type="monotone"
              dataKey="value"
              name={formatMessage(messages.numberOfVotes)}
              dot={false}
              fill={chartFill}
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
      );
    } else {
      return (
        <EmptyGraph unit="Votes" />
      );
    }
  }
}

export default injectIntl<Props>(withTheme(CommentsByTimeChart as any) as any);
