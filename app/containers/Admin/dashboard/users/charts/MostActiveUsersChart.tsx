import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { map } from 'lodash-es';
// components
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import { ResponsiveContainer } from 'recharts';
import { Popup } from 'semantic-ui-react';
import Icon from 'components/UI/Icon';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// styles
import styled, { withTheme } from 'styled-components';

// services
import { userEngagementScoresStream, IUserEngagementScores } from 'services/stats';

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
  serie: IUserEngagementScores[] | null;
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

  convertToGraphFormat = (serie: { [key: string]: number }) => {
    return map(serie, (value, key) => ({
      value,
      name: this.props.intl.formatMessage(messages[key]),
      code: key,
    }));
  }

  resubscribe(
    startAt = this.props.startAt,
    endAt = this.props.endAt,
    currentGroupFilter = this.props.currentGroupFilter) {
    if (this.subscription) this.subscription.unsubscribe();

    this.subscription = userEngagementScoresStream({
      queryParameters: {
        start_at: startAt,
        end_at: endAt,
        group: currentGroupFilter
      },
    }).observable.subscribe((serie) => {
      console.log(serie);
      // this.setState({ serie: this.convertToGraphFormat(serie) });
    });
  }

  render() {
    const { colorMain } = this.props['theme'];
    const { className, infoMessage } = this.props;
    const { serie } = this.state;

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
            <ResponsiveContainer>
              Test
            </ResponsiveContainer>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(MostActiveUsersChart as any) as any);
