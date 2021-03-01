// libraries
import React from 'react';
import { Subscription } from 'rxjs';
import { map, isEmpty } from 'lodash-es';

// intl
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IResourceByTime, IUsersByTime } from 'services/stats';
import { IGraphFormat } from 'typings';

// components
import ExportMenu from '../../components/ExportMenu';
import {
  BarChart,
  Bar,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  IGraphUnit,
  GraphCard,
  GraphCardInner,
  GraphCardHeader,
  GraphCardTitle,
  NoDataContainer,
  IResolution,
} from '../..';
import { Popup } from 'semantic-ui-react';
import { Icon } from 'cl2-component-library';

// styling
import styled, { withTheme } from 'styled-components';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  height: 22px;
  margin-left: 10px;
`;

const StyledResponsiveContainer = styled(ResponsiveContainer)`
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
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'short',
    });
  };

  formatLabel = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: resolution === 'month' ? undefined : '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  render() {
    const { className, graphTitle, infoMessage } = this.props;
    const { serie } = this.state;
    const {
      chartLabelSize,
      chartLabelColor,
      barHoverColor,
      animationBegin,
      animationDuration,
      newBarFill,
    } = this.props['theme'];

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
              <ExportMenu
                svgNode={this.currentChart}
                name={graphTitle}
                {...this.props}
              />
            )}
          </GraphCardHeader>
          {noData ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <StyledResponsiveContainer>
              <BarChart data={serie} ref={this.currentChart}>
                <Bar
                  dataKey="value"
                  name={graphTitle}
                  fill={newBarFill}
                  animationDuration={animationDuration}
                  animationBegin={animationBegin}
                  isAnimationActive={true}
                />
                <XAxis
                  dataKey="name"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                />
                <YAxis stroke={chartLabelColor} fontSize={chartLabelSize} />
                <Tooltip
                  isAnimationActive={false}
                  labelFormatter={this.formatLabel}
                  cursor={{ fill: barHoverColor }}
                />
              </BarChart>
            </StyledResponsiveContainer>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(
  withTheme(BarChartActiveUsersByTime as any) as any
);
