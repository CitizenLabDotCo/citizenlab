// libraries
import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

// utils
import shallowCompare from 'utils/shallowCompare';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// styling
import { withTheme } from 'styled-components';

// components
import ExportMenu from '../../components/ExportMenu';
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
import {
  usersByGenderStream,
  IUsersByGender,
  usersByGenderXlsxEndpoint,
} from 'services/stats';

type State = {
  serie: { name: string; value: number; code: string }[] | null;
};

interface QueryProps {
  startAt: string | undefined | null;
  endAt: string | null;
  currentGroupFilter: string | undefined;
}

interface Props extends QueryProps {
  currentGroupFilterLabel: string | undefined;
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
  private currentChart: React.RefObject<any>;

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      serie: null,
    };
    this.currentChart = React.createRef();
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
    const res = Object.keys(labelColors).map((gender) => ({
      value: data.series.users[gender] || 0,
      name: this.props.intl.formatMessage(messages[gender]),
      code: gender,
    }));
    return res.length > 0 ? res : null;
  };

  formatEntry(entry) {
    return `${entry.name} : ${entry.value}`;
  }

  render() {
    const { colorMain, animationDuration, animationBegin } = this.props[
      'theme'
    ];
    const {
      className,
      intl: { formatMessage },
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;
    const { serie } = this.state;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.usersByGenderTitle} />
            </GraphCardTitle>
            {serie && (
              <ExportMenu
                name={formatMessage(messages.usersByGenderTitle)}
                svgNode={this.currentChart}
                xlsxEndpoint={usersByGenderXlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
              />
            )}
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <ResponsiveContainer height={175} width="100%" minWidth={175}>
                <PieChart ref={this.currentChart}>
                  <Pie
                    isAnimationActive={true}
                    animationDuration={animationDuration}
                    animationBegin={animationBegin}
                    data={serie}
                    dataKey="value"
                    outerRadius={60}
                    fill={colorMain}
                    label={this.formatEntry}
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
