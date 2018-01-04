import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { injectIntl } from 'utils/cl-intl';
import { withTheme } from 'styled-components';
import { AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ideasByTimeStream } from 'services/stats';
import messages from '../messages';



type State = {
  serie: {name: string | number, value: number, code: string}[] | null;
};

type Props = {
  startAt: string,
  endAt: string,
  resolution: string,
  theme: any,
  intl: any,
};

class IdeasByTimeChart extends React.PureComponent<Props, State> {

  serieObservable: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.startAt !== this.props.startAt ||
      nextProps.endAt !== this.props.endAt ||
      nextProps.resolution !== this.props.resolution) {
      this.resubscribe(nextProps.startAt, nextProps.endAt, nextProps.resolution);
    }
  }

  convertToGraphFormat = (serie: {[key: string]: number}) => {
    return _.map(serie, (value, key) => ({
      value,
      name: key,
      code: key,
    }));
  }

  resubscribe(startAt = this.props.startAt, endAt = this.props.endAt, resolution = this.props.resolution) {
    if (this.serieObservable) this.serieObservable.unsubscribe();

    this.serieObservable = ideasByTimeStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie) as any;
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date) => {
    const tick = this.props.intl.formatDate(date, {
      day: this.props.resolution === 'month' ? undefined : '2-digit',
      month: 'short',
    });
    return tick;
  }

  formatLabel = (date) => {
    const label = this.props.intl.formatDate(date, {
      day: this.props.resolution ===  'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric'
    });
    return label;
  }


  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={this.state.serie} margin={{ right: 40 }}>
          <Area
            type="monotone"
            dataKey="value"
            name={this.props.intl.formatMessage(messages.numberOfIdeas)}
            dot={false}
            fill={this.props.theme.chartFill}
            fillOpacity={1}
            stroke={this.props.theme.chartStroke}
          />
          <XAxis
            dataKey="name"
            interval="preserveStartEnd"
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelSize}
            tick={{ transform: 'translate(0, 7)' }}
            tickFormatter={this.formatTick}
          />
          <YAxis
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelSize}
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

export default withTheme(injectIntl(IdeasByTimeChart));
