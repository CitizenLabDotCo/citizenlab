// libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { map, isEmpty } from 'lodash-es';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import moment from 'moment';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IResourceByTime, IUsersByTime } from 'services/stats';
import { IGraphFormat } from 'typings';

// components
import ReportExportMenu from 'components/admin/ReportExportMenu';
import {
  IGraphUnit,
  GraphCard,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
} from 'components/admin/GraphWrappers';
import BarChart from 'components/admin/Graphs/BarChart';
import { Tooltip } from 'recharts';
import { IResolution } from 'components/admin/ResolutionControl';
import { Popup } from 'semantic-ui-react';
import { Icon } from '@citizenlab/cl2-component-library';

// styling
import styled from 'styled-components';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  height: 22px;
  margin-left: 10px;
`;

const StyledBarChart = styled(BarChart)`
  .recharts-wrapper {
    @media print {
      margin: 0 auto;
    }
  }
`;

type State = {
  serie: IGraphFormat | null;
};

type Props = {
  className?: string;
  graphUnit: IGraphUnit;
  graphUnitMessageKey: string;
  graphTitle: string;
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter?: string | undefined;
  currentGroupFilter?: string | undefined;
  currentTopicFilter?: string | undefined;
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByTime>;
  infoMessage?: string;
  currentProjectFilterLabel?: string | undefined;
  currentGroupFilterLabel?: string | undefined;
  currentTopicFilterLabel?: string | undefined;
  xlsxEndpoint: string;
};

class BarChartActiveUsersByTime extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscription: Subscription;
  currentChart: React.RefObject<any>;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };

    this.currentChart = React.createRef();
  }

  componentDidMount() {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;
    this.resubscribe(
      startAt,
      endAt,
      resolution,
      currentProjectFilter,
      currentGroupFilter,
      currentTopicFilter
    );
  }

  componentDidUpdate(prevProps: Props) {
    const {
      startAt,
      endAt,
      resolution,
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
    } = this.props;

    if (
      startAt !== prevProps.startAt ||
      endAt !== prevProps.endAt ||
      resolution !== prevProps.resolution ||
      currentGroupFilter !== prevProps.currentGroupFilter ||
      currentTopicFilter !== prevProps.currentTopicFilter ||
      currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(
        startAt,
        endAt,
        resolution,
        currentProjectFilter,
        currentGroupFilter,
        currentTopicFilter
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (data: IResourceByTime) => {
    const { graphUnit } = this.props;

    if (!isEmpty(data.series[graphUnit])) {
      return map(data.series[graphUnit], (value, key) => ({
        value,
        name: key,
        code: key,
      }));
    }

    return null;
  };

  resubscribe(
    startAt: string | null | undefined,
    endAt: string | null,
    resolution: IResolution,
    currentProjectFilter: string | undefined,
    currentGroupFilter: string | undefined,
    currentTopicFilter: string | undefined
  ) {
    const { stream } = this.props;

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.subscription = stream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        interval: resolution,
        project: currentProjectFilter,
        group: currentGroupFilter,
        topic: currentTopicFilter,
      },
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie);
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date: string) => {
    const { resolution } = this.props;
    return moment
      .utc(date, 'YYYY-MM-DD')
      .format(resolution === 'month' ? 'MMM' : 'DD MMM');
  };

  formatLabel = (date: string) => {
    const { resolution } = this.props;
    return moment
      .utc(date, 'YYYY-MM-DD')
      .format(resolution === 'month' ? 'MMMM YYYY' : 'MMMM DD, YYYY');
  };
  render() {
    const { className, graphTitle, infoMessage } = this.props;
    const { serie } = this.state;

    const noData =
      !serie || serie.every((item) => isEmpty(item)) || serie.length <= 0;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              {graphTitle}
              {infoMessage && (
                <Popup
                  basic
                  trigger={
                    <div>
                      <InfoIcon name="info" />
                    </div>
                  }
                  content={infoMessage}
                  position="top left"
                />
              )}
            </GraphCardTitle>
            {!noData && (
              <ReportExportMenu
                svgNode={this.currentChart}
                name={graphTitle}
                {...this.props}
              />
            )}
          </GraphCardHeader>
          <StyledBarChart
            data={serie}
            innerRef={this.currentChart}
            xaxis={{ tickFormatter: this.formatTick }}
            renderTooltip={(props) => (
              <Tooltip {...props} labelFormatter={this.formatLabel} />
            )}
          />
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(BarChartActiveUsersByTime);
