import React from 'react';
import { Subscription } from 'rxjs';
import { range, forOwn, get, isEmpty } from 'lodash-es';
import moment from 'moment';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByBirthyear } from 'services/stats';
import messages from '../../messages';

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
  graphUnit: 'ActiveUsers' | 'Users' | 'Ideas' | 'Comments' | 'Votes';
  graphTitleMessageKey: string;
  className: string;
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByBirthyear>;
};

class BarChartByCategory extends React.PureComponent<Props & InjectedIntlProps, State> {
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

    this.subscription = this.props.stream({
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
    const { className, graphTitleMessageKey } = this.props;
    const { serie } = this.state;
    const noData = !serie || (serie.every(item => isEmpty(item)) || serie.length <= 0);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
            </GraphCardTitle>
          </GraphCardHeader>
          {noData ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
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
            </ResponsiveContainer>}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(BarChartByCategory as any) as any);
