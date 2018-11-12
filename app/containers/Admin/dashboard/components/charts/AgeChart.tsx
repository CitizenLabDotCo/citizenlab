import React from 'react';
import { Subscription } from 'rxjs';
import { range, forOwn, get } from 'lodash-es';
import moment from 'moment';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { usersByBirthyearStream, IUsersByBirthyear } from 'services/stats';
import messages from '../../messages';
import EmptyGraph from '../EmptyGraph';

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
  currentGroupFilter: string | null,
};

class AgeChart extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props) {
    super(props);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.startAt !== prevProps.startAt
      || this.props.endAt !== prevProps.endAt
      || this.props.currentGroupFilter !== prevProps.currentGroupFilter) {
      this.resubscribe(this.props.startAt, this.props.endAt, this.props.currentGroupFilter);
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

  resubscribe(
    startAt = this.props.startAt,
    endAt = this.props.endAt,
    currentGroupFilter = this.props.currentGroupFilter) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = usersByBirthyearStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        group: currentGroupFilter
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie) as any;
      this.setState({ serie: convertedSerie });
    });
  }

  render() {
    const { chartFill, barFill, chartLabelSize, chartLabelColor } = this.props['theme'];
    const { serie } = this.state;
    const isEmpty = !serie || serie.every(item => item.value === 0);

    if (!isEmpty) {
      return (
        <ResponsiveContainer>
          <BarChart data={this.state.serie} margin={{ right: 40 }}>
            <Bar
              dataKey="value"
              name="name"
              fill={chartFill}
              label={{ fill: barFill, fontSize: chartLabelSize }}
            />
            <XAxis
              dataKey="name"
              stroke={chartLabelColor}
              fontSize={chartLabelSize}
              tick={{ transform: 'translate(0, 7)' }}
            />
            <YAxis
              stroke={chartLabelColor}
              fontSize={chartLabelSize}
            />
            <Tooltip isAnimationActive={false} />

          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <EmptyGraph unit="Users"/>
      );
    }
  }
}

export default injectIntl<Props>(withTheme(AgeChart as any) as any);
