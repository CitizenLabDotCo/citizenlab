import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// components
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import { BarChart, Bar, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Popup } from 'semantic-ui-react';
import Icon from 'components/UI/Icon';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// styles
import styled, { withTheme } from 'styled-components';
import { rgba } from 'polished';

// services
import { userEngagementScoresStream, IUserEngagementScore } from 'services/stats';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  margin-left: 10px;
`;

interface Props {
  className?: string;
  infoMessage?: string;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | null;
}

interface State {
  serie: {
    value: number;
    userId: string;
  }[] | null;
}

class MostActiveUsersChart extends PureComponent<Props & InjectedIntlProps, State> {
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

  convertToGraphFormat = (serie: IUserEngagementScore[]) => {
    return serie.map(userEngagementScore => ({
      value: userEngagementScore.attributes.sum_score,
      userId: userEngagementScore.relationships.user.data.id
    }));
  }

  resubscribe(
    startAt = this.props.startAt,
    endAt = this.props.endAt,
    currentGroupFilter = this.props.currentGroupFilter
  ) {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = userEngagementScoresStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        group: currentGroupFilter
      },
    }).observable.subscribe((stream) => {
      const serie = stream.data;
      const convertedSerie = this.convertToGraphFormat(serie);
      this.setState({ serie: convertedSerie });
    });
  }

  render() {
    const { className, infoMessage } = this.props;
    const { formatMessage } = this.props.intl;
    const { serie } = this.state;
    const theme = this.props['theme'];
    const { chartFill, barFill, chartLabelSize } = theme;
    const barHoverColor = rgba(chartFill, .25);

    console.log(serie);
    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.mostActiveUsers} />
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
            </GraphCardTitle>
          </GraphCardHeader>
          {!serie ?
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
            :
            <ResponsiveContainer width="100%" height={serie && (serie.length * 50)}>
              <BarChart data={serie} layout="vertical" margin={{ left: 150 }}>
                <Bar
                  dataKey="value"
                  name={formatMessage(messages.userActivityScore)}
                  fill={chartFill}
                  label={{ fill: barFill, fontSize: chartLabelSize }}
                  barSize={20}
                />
                <YAxis
                  dataKey="userId"
                  type="category"
                  width={150}
                  stroke={theme.chartLabelColor}
                  fontSize={theme.chartLabelSize}
                  tickLine={false}

                />
                <XAxis
                  stroke={theme.chartLabelColor}
                  fontSize={theme.chartLabelSize}
                  type="number"
                  tick={{ transform: 'translate(0, 7)' }}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ fill: barHoverColor }}
                />
              </BarChart>
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(MostActiveUsersChart as any) as any);
