import React from 'react';
import { Subscription } from 'rxjs';
import { map, isEmpty } from 'lodash-es';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import messages from '../../messages';
import { rgba } from 'polished';

// typings
import { IStreamParams, IStream } from 'utils/streams';
import { IUsersByTime } from 'services/stats';

// components
import { GraphCard, NoDataContainer, GraphCardInner, GraphCardHeader, GraphCardTitle } from '../..';
import { Popup } from 'semantic-ui-react';
import Icon from 'components/UI/Icon';
import { colors } from 'utils/styleUtils';

const TitleWithInfoIcon = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  margin-left: 10px;
`;

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
  stream: (streamParams?: IStreamParams | null) => IStream<IUsersByTime>;
  infoMessage: string;
};

class BarChartByTime extends React.PureComponent<Props & InjectedIntlProps, State> {
  subscription: Subscription;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      serie: null,
    };
  }

  componentDidMount() {
    const { startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter } = this.props;
    this.resubscribe(startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter);
  }

  componentDidUpdate(prevProps: Props) {
    const { startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter } = this.props;

    if (startAt !== prevProps.startAt
      || endAt !== prevProps.endAt
      || resolution !== prevProps.resolution
      || currentGroupFilter !== prevProps.currentGroupFilter
      || currentTopicFilter !== prevProps.currentTopicFilter
      || currentProjectFilter !== prevProps.currentProjectFilter
    ) {
      this.resubscribe(startAt, endAt, resolution, currentGroupFilter, currentTopicFilter, currentProjectFilter);
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
    currentProjectFilter: string | null,
    currentGroupFilter: string | null,
    currentTopicFilter: string | null
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

  render() {
    const { formatMessage } = this.props.intl;
    const { className, graphTitleMessageKey, graphUnit, infoMessage } = this.props;
    const { serie } = this.state;
    const noData = (serie && serie.every(item => isEmpty(item))) || false;
    const { chartFill, chartLabelSize, chartLabelColor } = this.props['theme'];
    const barHoverColor = rgba(chartFill, .25);

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <TitleWithInfoIcon>
              <GraphCardTitle>
                <FormattedMessage {...messages[graphTitleMessageKey]} />
              </GraphCardTitle>
              {infoMessage && <Popup
                basic
                trigger={
                  <div>
                    <InfoIcon name="info" />
                  </div>
                }
                content={infoMessage}
                position="top left"
              />}
            </TitleWithInfoIcon>
          </GraphCardHeader>
          {noData ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
            <ResponsiveContainer>
              <BarChart data={serie} margin={{ right: 40 }}>
                <Bar
                  dataKey="value"
                  name={formatMessage(messages[`numberOf${graphUnit}`])}
                  fill={chartFill}
                />
                <XAxis
                  dataKey="name"
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
                  cursor={{
                    fill: barHoverColor,
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(BarChartByTime as any) as any);
