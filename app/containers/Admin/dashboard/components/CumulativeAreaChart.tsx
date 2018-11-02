import React from 'react';
import { Subscription } from 'rxjs';
import { map, isNumber } from 'lodash-es';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { withTheme } from 'styled-components';
import { AreaChart, Area, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import messages from '../messages';

// components
import EmptyGraph from './EmptyGraph';
import { GraphCard, GraphCardInner, GraphCardTitle, GraphCardFigureContainer, GraphCardFigure, GraphCardFigureChange } from '../';

type State = {
  serie: {
    name: string | number,
    value: number,
    code: string
  }[] | null;
};

type Props = {
  className?: string;
  graphUnit: 'ActiveUsers' | 'Users' | 'Ideas' | 'Comments' | 'Votes';
  graphTitleMessageKey: string;
  startAt: string;
  endAt: string;
  resolution: 'month' | 'day';
  currentProjectFilter: string | null;
  currentGroupFilter: string | null;
  currentTopicFilter: string | null;
  stream: Function;
};

class CumulativeAreaChart extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props & InjectedIntlProps) {
    super(props as any);
    this.state = {
      serie: null,
    };
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
      currentGroupFilter,
      currentTopicFilter,
      currentProjectFilter,
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

    if (startAt !== prevProps.startAt
      || endAt !== prevProps.endAt
      || resolution !== prevProps.resolution
      || currentGroupFilter !== prevProps.currentGroupFilter
      || currentTopicFilter !== prevProps.currentTopicFilter
      || currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(
        startAt,
        endAt,
        resolution,
        currentGroupFilter,
        currentTopicFilter,
        currentProjectFilter,
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  convertToGraphFormat = (serie: { [key: string]: number }) => {
    return map(serie, (value, key) => ({
      value,
      name: key,
      code: key
    }));
  }

  resubscribe(
    startAt: string,
    endAt: string,
    resolution: 'month' | 'day',
    currentGroupFilter: string | null,
    currentTopicFilter: string | null,
    currentProjectFilter: string | null,
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
      }
    }).observable.subscribe((serie) => {
      const convertedSerie = this.convertToGraphFormat(serie);
      this.setState({ serie: convertedSerie });
    });
  }

  formatTick = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: (resolution === 'month' ? undefined : '2-digit'),
      month: 'short',
    });
  }

  formatLabel = (date: string) => {
    const { resolution } = this.props;
    const { formatDate } = this.props.intl;

    return formatDate(date, {
      day: (resolution === 'month' ? undefined : '2-digit'),
      month: 'long',
      year: 'numeric'
    });
  }

  formatSerieChange = (serieChange: number) => {
    if (serieChange > 0) {
      return `(+${serieChange.toString()})`;
    } else if (serieChange < 0) {
      return `(${serieChange.toString()})`;
    }
    return null;
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { className, graphTitleMessageKey, graphUnit } = this.props;
    const { serie } = this.state;
    const isEmpty = !serie || serie.every(item => item.value === 0);
    const { chartFill, chartLabelSize, chartLabelColor, chartStroke } = this.props['theme'];
    const firstSerieValue = serie && serie[0].value;
    const lastSerieValue = serie && serie[serie.length - 1].value;
    const serieChange = isNumber(firstSerieValue) && isNumber(lastSerieValue) && (lastSerieValue - firstSerieValue);
    const formattedSerieChange = isNumber(serieChange) ? this.formatSerieChange(serieChange) : null;

    return (
      <GraphCard className={className}>
        {!isEmpty ?
          <GraphCardInner>
            <GraphCardTitle>
              <FormattedMessage {...messages[graphTitleMessageKey]} />
              <GraphCardFigureContainer>
                <GraphCardFigure>
                  {lastSerieValue}
                </GraphCardFigure>
                <GraphCardFigureChange>
                  {formattedSerieChange}
                </GraphCardFigureChange>
              </GraphCardFigureContainer>
            </GraphCardTitle>
            <ResponsiveContainer>
              <AreaChart data={serie}>
                <Area
                  type="monotone"
                  dataKey="value"
                  name={formatMessage(messages[`numberOf${graphUnit}`])}
                  dot={false}
                  fill={chartFill}
                  fillOpacity={1}
                  stroke={chartStroke}
                />
                <XAxis
                  dataKey="name"
                  interval="preserveStartEnd"
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                  tick={{ transform: 'translate(0, 7)' }}
                  tickFormatter={this.formatTick}
                />
                <YAxis
                  stroke={chartLabelColor}
                  fontSize={chartLabelSize}
                />
                <Tooltip
                  isAnimationActive={false}
                  labelFormatter={this.formatLabel}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GraphCardInner>
        :
          <EmptyGraph unit={graphUnit} />
        }
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(CumulativeAreaChart as any) as any);
