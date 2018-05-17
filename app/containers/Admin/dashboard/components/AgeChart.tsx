import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { range, forOwn, get } from 'lodash';
import moment from 'moment';
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

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (serie: IUsersByBirthyear) => {
    const currentYear = moment().year();

    return [
      ...range(0, 100, 10).map((minAge) => {
        let numberOfUsers = 0;
        const maxAge = (minAge + 10);

        forOwn(serie, (userCount, birthYear) => {
          const age = currentYear - parseInt(birthYear, 10);

          if (age >= minAge && age <= maxAge) {
            numberOfUsers = userCount;
          }
        });

        return {
          name: `${minAge} - ${maxAge}`,
          value: numberOfUsers,
          code: `${minAge}`
        };
      }),
      {
        name: this.props.intl.formatMessage(messages._blank),
        value: get(serie, '_blank', 0),
        code: ''
      }
    ];
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
