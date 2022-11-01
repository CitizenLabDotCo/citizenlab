// libraries
import React, { PureComponent } from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';

// utils
import shallowCompare from 'utils/shallowCompare';
import renderTooltip from './renderGenderTooltip';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from 'containers/Admin/dashboard/messages';

// styling
import { withTheme } from 'styled-components';
import { categoricalColorScheme } from 'components/admin/Graphs/styling';

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

// typings
import { LegendItem } from 'components/admin/Graphs/_components/Legend/typings';

type State = {
  serie: { name: string; value: number; code: string }[] | null;
  hoverIndex: number | undefined;
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

class GenderChart extends PureComponent<Props & WrappedComponentProps, State> {
  private subscriptions: Subscription[];
  private queryProps$: BehaviorSubject<QueryProps>;
  private currentChart: React.RefObject<any>;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      serie: null,
      hoverIndex: undefined,
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
    const res = ['male', 'female', 'unspecified', '_blank'].map((gender) => ({
      value: data.series.users[gender] || 0,
      name: this.props.intl.formatMessage(messages[gender]),
      code: gender,
    }));
    return res.length > 0 ? res : null;
  };

  onMouseOver = ({ rowIndex }) => {
    this.setState({ hoverIndex: rowIndex });
  };

  onMouseOut = () => {
    this.setState({ hoverIndex: undefined });
  };

  render() {
    const {
      startAt,
      endAt,
      className,
      intl: { formatMessage },
      currentGroupFilter,
      currentGroupFilterLabel,
    } = this.props;
    const { serie } = this.state;

    const legend =
      serie &&
      serie.map(
        (row, i): LegendItem => ({
          icon: 'circle',
          color: categoricalColorScheme({ rowIndex: i }),
          label: row.name,
        })
      );

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
                xlsx={{ endpoint: usersByGenderXlsxEndpoint }}
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
                width={164}
                mapping={{
                  angle: 'value',
                  name: 'name',
                  opacity: ({ rowIndex }) => {
                    if (this.state.hoverIndex === undefined) return 1;
                    return this.state.hoverIndex === rowIndex ? 1 : 0.3;
                  },
                }}
                pie={{
                  startAngle: 0,
                  endAngle: 360,
                  outerRadius: 60,
                }}
                innerRef={this.currentChart}
                tooltip={renderTooltip()}
                legend={{
                  items: legend as LegendItem[],
                  maintainGraphSize: true,
                  marginLeft: 50,
                  position: 'right-center',
                }}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
              />
            </PieChartStyleFixesDiv>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default withTheme(injectIntl(GenderChart as any) as any);
