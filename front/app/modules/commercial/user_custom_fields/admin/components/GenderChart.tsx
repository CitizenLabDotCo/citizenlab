// libraries
import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

// utils
import shallowCompare from 'utils/shallowCompare';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';

// styling
import { withTheme } from 'styled-components';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import PieChart from 'components/admin/Graphs/PieChart';

// services
import {
  usersByGenderStream,
  IUsersByRegistrationField,
  usersByGenderXlsxEndpoint,
} from 'modules/commercial/user_custom_fields/services/stats';

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

  convertToGraphFormat = (data: IUsersByRegistrationField) => {
    const res = Object.keys(labelColors).map((gender) => ({
      value: data.series.users[gender] || 0,
      name: this.props.intl.formatMessage(messages[gender]),
      code: gender,
    }));
    return res.length > 0 ? res : null;
  };

  render() {
    const { colorMain } = this.props['theme'];
    const {
      startAt,
      endAt,
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
              <ReportExportMenu
                name={formatMessage(messages.usersByGenderTitle)}
                svgNode={this.currentChart}
                xlsxEndpoint={usersByGenderXlsxEndpoint}
                currentGroupFilterLabel={currentGroupFilterLabel}
                currentGroupFilter={currentGroupFilter}
                startAt={startAt}
                endAt={endAt}
              />
            )}
          </GraphCardHeader>
          {!serie ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <PieChartStyleFixesDiv>
              <PieChart
                data={serie}
                mapping={{
                  angle: 'value',
                  name: 'name',
                  fill: ({ row }) => labelColors[row.code] ?? colorMain,
                }}
                pie={{
                  startAngle: 0,
                  endAngle: 360,
                  outerRadius: 60,
                }}
                innerRef={this.currentChart}
                annotations
              />
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(GenderChart as any) as any);
