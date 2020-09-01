// libraries
import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { map } from 'lodash-es';

// utils
import shallowCompare from 'utils/shallowCompare';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from '../..';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

// services
import { usersByGenderStream, IUsersByGender } from 'services/stats';

type State = {
  serie: { name: string; value: number; code: string }[] | null;
};

interface QueryProps {
  startAt: string | undefined | null;
  endAt: string | null;
  currentGroupFilter: string | undefined;
}

interface Props extends QueryProps {
  className?: string;
}

const labelColors = {
  male: '#5D99C6 ',
  female: '#C37281 ',
  unspecified: '#B0CDC4 ',
  _blank: '#C0C2CE',
};

class GenderChart extends PureComponent<Props & InjectedIntlProps, State> {
  private subscriptions: Subscription[];
  private queryProps$: BehaviorSubject<QueryProps>;

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    const { startAt, endAt, currentGroupFilter } = this.props;

    this.queryProps$ = new BehaviorSubject({
      startAt,
      endAt,
      currentGroupFilter,
    });

    this.subscriptions = [
      this.queryProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(
            ({ startAt, endAt, currentGroupFilter }) =>
              usersByGenderStream({
                queryParameters: {
                  start_at: startAt,
                  end_at: endAt,
                  group: currentGroupFilter,
                },
              }).observable
          )
        )
        .subscribe((serie) => {
          const convertedSerie = serie && this.convertToGraphFormat(serie);
          this.setState({ serie: convertedSerie });
        }),
    ];
  }

  componentDidUpdate(prevProps: Props) {
    const { startAt, endAt, currentGroupFilter } = this.props;

    if (
      startAt !== prevProps.startAt ||
      endAt !== prevProps.endAt ||
      currentGroupFilter !== prevProps.currentGroupFilter
    ) {
      this.queryProps$.next({ startAt, endAt, currentGroupFilter });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  convertToGraphFormat = (data: IUsersByGender) => {
    const res = map(data.series.users, (value, key) => ({
      value,
      name: this.props.intl.formatMessage(messages[key]),
      code: key,
    }));
    return res.length > 0 ? res : null;
  };

  render() {
    const {
      colorMain,
      chartLabelSize,
      chartLabelColor,
      animationDuration,
      animationBegin,
    } = this.props['theme'];
    const { className } = this.props;
    const { serie } = this.state;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.usersByGenderTitle} />
            </GraphCardTitle>
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <ResponsiveContainer height={175} width="100%" minWidth={175}>
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                    isAnimationActive={false}
                    data={serie}
                    dataKey="value"
                    innerRadius={60}
                    fill={colorMain}
                    label={{ fill: chartLabelColor, fontSize: chartLabelSize }}
                  >
                    {serie.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={labelColors[entry.code]}
                      />
                    ))}
                  </Pie>
                  <Tooltip isAnimationActive={false} />
                </PieChart>
              </ResponsiveContainer>
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(GenderChart as any) as any);
