import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { map } from 'lodash-es';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import messages from '../../messages';
import { colors } from 'utils/styleUtils';
// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByGender } from 'services/stats';

type State = {
  serie: { name: string, value: number, code: string }[] | null;
};

interface Props {
  startAt: string;
  endAt: string;
  graphUnit: 'ActiveUsers' | 'Users' | 'Ideas' | 'Comments' | 'Votes';
  graphTitleMessageKey: string;
  currentGroupFilter: string | null;
  className: string;
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByGender>;
}

const labelColors = {
  male: '#5D99C6 ',
  female: '#C37281 ',
  unspecified: '#B0CDC4 ',
  _blank: '#C0C2CE',
};

class PieChartByCategory extends PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props & InjectedIntlProps) {
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

  convertToGraphFormat = (serie: { [key: string]: number }) => {
    return map(serie, (value, key) => ({
      value,
      name: this.props.intl.formatMessage(messages[key]),
      code: key,
    }));
  }

  resubscribe(
    startAt = this.props.startAt,
    endAt = this.props.endAt,
    currentGroupFilter = this.props.currentGroupFilter) {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = this.props.stream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        group: currentGroupFilter
      },
    }).observable.subscribe((serie) => {
      this.setState({ serie: this.convertToGraphFormat(serie) });
    });
  }

  render() {
    const { colorMain } = this.props['theme'];
    const { className, graphTitleMessageKey } = this.props;
    const { serie } = this.state;
    const noData = !serie || serie.every(item => item.value === 0);

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
              <PieChart>
                <Pie
                  isAnimationActive={true}
                  animationDuration={200}
                  data={serie}
                  dataKey="value"
                  innerRadius={60}
                  fill={colorMain}
                  label={{ fill: colors.adminTextColor, fontSize: '14px' }}
                >
                  {serie && serie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={labelColors[entry.code]} />
                  ))}
                </Pie>
                <Tooltip isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(PieChartByCategory as any) as any);
