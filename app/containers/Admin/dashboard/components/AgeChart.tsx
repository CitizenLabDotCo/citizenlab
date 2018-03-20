import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import _ from 'lodash';
import fp from 'lodash/fp';
import * as moment from 'moment';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usersByBirthyearStream, IUsersByBirthyear } from 'services/stats';
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
  endAt: string
};

class AgeChart extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Rx.Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.startAt !== prevProps.startAt || this.props.endAt !== prevProps.endAt) {
      this.resubscribe(this.props.startAt, this.props.endAt);
    }
  }

  convertToGraphFormat = (serie: IUsersByBirthyear) => {
    const currentYear = moment().year();

    return fp.flow(
      fp.map((value, key) => ({ age: key, count: value })),
      fp.concat(_.map(_.range(currentYear, currentYear - 90, -10), (a) => ({ age: a.toString(), count: 0 }))),
      fp.groupBy(({ age }) => {
        return age === '_blank' ? age : (Math.floor((currentYear - parseInt(age, 10)) / 10) * 10);
      }),
      fp.map((counts, age) => ({
        name: age === '_blank' ? this.props.intl.formatMessage(messages._blank) : `${age}-${parseInt(age, 10) + 10}`,
        value: _.sumBy(counts, 'count'),
        code: age,
      })),
    )(serie);
  }

  resubscribe(startAt= this.props.startAt, endAt= this.props.endAt) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = usersByBirthyearStream({
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
    const theme = this.props['theme'];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={this.state.serie} margin={{ right: 40 }}>
          <Bar
            dataKey="value"
            name="name"
            fill={theme.chartFill}
            label={{ fill: theme.barFill, fontSize: theme.chartLabelSize }}
          />
          <XAxis
            dataKey="name"
            stroke={theme.chartLabelColor}
            fontSize={theme.chartLabelSize}
            tick={{ transform: 'translate(0, 7)' }}
          />
          <YAxis
            stroke={theme.chartLabelColor}
            fontSize={theme.chartLabelSize}
          />
          <Tooltip isAnimationActive={false} />

        </BarChart>
      </ResponsiveContainer>
    );
  }
}

export default injectIntl<Props>(withTheme(AgeChart as any) as any);
