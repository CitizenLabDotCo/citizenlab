// libraries
import React, { PureComponent } from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

// utils
import shallowCompare from 'utils/shallowCompare';

// intl
import messages from 'containers/Admin/dashboard/messages';
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';

// styling
import { withTheme } from 'styled-components';

// components
import PieChart from 'components/admin/Graphs/PieChart';
import {
  GraphCard,
  GraphCardHeader,
  GraphCardInner,
  GraphCardTitle,
  NoDataContainer,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';

// services
import {
  IUsersByRegistrationField,
  usersByGenderStream,
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

class GenderChart extends PureComponent<
  Props & { theme: any } & WrappedComponentProps,
  State
> {
  private subscriptions: Subscription[];
  private queryProps$: BehaviorSubject<QueryProps>;
  private currentChart: React.RefObject<any>;

  constructor(props: Props & { theme: any } & WrappedComponentProps) {
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

export default withTheme(injectIntl(GenderChart));
