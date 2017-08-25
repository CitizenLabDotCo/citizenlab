import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import * as moment from 'moment';
import { injectIntl } from 'react-intl';
import { withTheme } from 'styled-components'
import { AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { observeUsersByTime } from 'services/stats';
import messages from '../messages';



type State = {
  serie: Array<{name: string | number, value: number, code: string}> | null;
};

type Props = {
  startAt: string,
  endAt: string,
  interval: string,
  theme: any,
  intl: any,
}

class UsersByTimeChart extends React.Component<Props, State> {

  serieObservable: Rx.Subscription;

  constructor() {
    super();
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
      nextProps.interval !== this.props.interval) {
      this.resubscribe(nextProps.startAt, nextProps.endAt, nextProps.interval);
    }
  }

  convertToGraphFormat = (serie: {[key: string]: number}) => {
    const currentYear = moment().year();
    return _.map(serie, (value, key) => ({
      name: key,
      value,
      code: key,
    }));
  }

  resubscribe(startAt=this.props.startAt, endAt=this.props.endAt, interval=this.props.interval) {
    if (this.serieObservable) this.serieObservable.unsubscribe();
    this.serieObservable = observeUsersByTime({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: interval,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie) as any;
      this.setState({ serie: convertedSerie });
    });
  }


  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={this.state.serie} margin={{ right: 40 }}>
          <Area
            type="monotone"
            dataKey="value"
            dot={false}
            fill={this.props.theme.chartFill}
            fillOpacity={1}
            stroke={this.props.theme.chartStroke}
          />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip isAnimationActive={false} />

        </AreaChart>
      </ResponsiveContainer>
    );
  }
}

export default withTheme(injectIntl(UsersByTimeChart));
