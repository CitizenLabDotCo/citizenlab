import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import * as moment from 'moment';
import { injectIntl } from 'utils/cl-intl';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usersByBirthyearStream } from 'services/stats';
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
  theme: any,
  intl: any,
};

class AgeChart extends React.PureComponent<Props, State> {

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
      nextProps.endAt !== this.props.endAt) {
      this.resubscribe(nextProps.startAt, nextProps.endAt);
    }
  }

  convertToGraphFormat = (serie: {[key: string]: number}) => {
    const currentYear = moment().year();

    return _(serie)
      .map((value, key) => ({ age: key, count: value }))
      .concat(_.map(_.range(currentYear, currentYear - 90, -10), (a) => ({ age: a.toString(), count: 0 })))
      .groupBy(({ age }) => {
        return age === '_blank' ? age : (Math.floor((currentYear - parseInt(age, 10)) / 10) * 10);
      })
      .map((counts, age) => ({
        name: age === '_blank' ? this.props.intl.formatMessage(messages._blank) : `${age}-${parseInt(age, 10) + 10}`,
        value: _.sumBy(counts, 'count'),
        code: age,
      }))
      .value();
  }

  resubscribe(startAt= this.props.startAt, endAt= this.props.endAt) {
    if (this.serieObservable) this.serieObservable.unsubscribe();

    this.serieObservable = usersByBirthyearStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie) as any;
      this.setState({ serie: convertedSerie });
    });
  }

  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={this.state.serie} margin={{ right: 40 }}>
          <Bar
            dataKey="value"
            name="name"
            fill={this.props.theme.chartFill}
            label={{ fill: this.props.theme.barFill, fontSize: this.props.theme.chartLabelSize }}
          />
          <XAxis
            dataKey="name"
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelSize}
            tick={{ transform: 'translate(0, 7)' }}
          />
          <YAxis
            stroke={this.props.theme.chartLabelColor}
            fontSize={this.props.theme.chartLabelSize}
          />
          <Tooltip isAnimationActive={false} />

        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default withTheme(injectIntl(AgeChart));
