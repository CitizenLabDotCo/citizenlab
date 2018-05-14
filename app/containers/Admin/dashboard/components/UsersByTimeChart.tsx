import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { map } from 'lodash';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usersByTimeStream } from 'services/stats';
import messages from '../messages';

type State = {
  serie: {
    name: string | number,
    value: number,
    code: string
  }[] | null;
};

type Props = {
  startAt: string,
  endAt: string,
  resolution: 'month' | 'day';
};

class UsersByTimeChart extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null
    };
  }

  componentDidMount() {
    const { startAt, endAt, resolution } = this.props;
    this.resubscribe(startAt, endAt, resolution);
  }

  componentDidUpdate(prevProps: Props) {
    const { startAt, endAt, resolution } = this.props;

    if (startAt !== prevProps.startAt || endAt !== prevProps.endAt || resolution !== prevProps.resolution) {
      this.resubscribe(startAt, endAt, resolution);
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

  resubscribe(startAt: string, endAt: string, resolution: 'month' | 'day') {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = usersByTimeStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
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

  render() {
    const theme = this.props['theme'];
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={serie} margin={{ right: 40 }}>
          <Area
            type="monotone"
            dataKey="value"
            name={formatMessage(messages.numberOfRegistrations)}
            dot={false}
            fill={theme.chartFill}
            fillOpacity={1}
            stroke={theme.chartStroke}
          />
          <XAxis
            dataKey="name"
            interval="preserveStartEnd"
            stroke={theme.chartLabelColor}
            fontSize={theme.chartLabelSize}
            tick={{ transform: 'translate(0, 7)' }}
            tickFormatter={this.formatTick}
          />
          <YAxis
            stroke={theme.chartLabelColor}
            fontSize={theme.chartLabelSize}
          />
          <Tooltip
            isAnimationActive={false}
            labelFormatter={this.formatLabel}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
}

export default injectIntl<Props>(withTheme(UsersByTimeChart as any) as any);
