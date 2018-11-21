import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

// components
import { NoDataContainer, GraphCardHeader, GraphCardTitle, GraphCard, GraphCardInner } from '../..';
import { Popup } from 'semantic-ui-react';
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// styles
import styled, { withTheme } from 'styled-components';
import { rgba } from 'polished';
import { media, colors } from 'utils/styleUtils';

// services
import { userEngagementScoresStream, IUserEngagementScore } from 'services/stats';

// resources
import GetUser from 'resources/GetUser';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  margin-left: 10px;
`;

const UserList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0 20px;
`;

const UserListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const User = styled.div`
  display: flex;
  flex-basis: 100%;
  max-width: 50%;
  align-items: center;

  ${media.smallerThan1280px`
    max-width: 70%;
  `}
`;

const UserImage = styled(Avatar)`
  margin-right: 10px;

  svg {
    fill: ${colors.label};
  }
`;

const UserName = styled(Link)`
  color: ${colors.label};
  margin-right: 10px;
`;

const UserScore = styled<any, 'div'>('div')`
  background-color: ${props => props.theme.chartFill};
  width: ${props => props.value * 8}px;
  color: #fff;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: ${props => props.hoverColor};
    color: ${props => props.theme.chartFill};
  }

  ${media.smallerThan1280px`
    width: ${props => props.value * 4}px;
  `}
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
      userId: userEngagementScore.relationships.user.data.id,
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

  formatName = (firstName: string, lastName: string) => {
    let fullName = `${firstName} ${lastName}`;

    if (fullName.length > 20) {
      fullName = `${fullName.slice(0, 22)}...`;
    }

    return fullName;
  }

  render() {
    const { className, infoMessage } = this.props;
    const { serie } = this.state;
    const theme = this.props['theme'];
    const { chartFill } = theme;
    const barHoverColor = rgba(chartFill, .25);

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
            <UserList>
              {serie.map((item) => (
                <UserListItem key={item.userId}>
                  <User>
                    <UserImage size="28px" userId={item.userId} />
                    <GetUser id={item.userId}>
                      {user => {
                        const firstName: string = get(user, 'attributes.first_name', '');
                        const lastName: string = get(user, 'attributes.last_name', '');
                        const fullName = this.formatName(firstName, lastName);

                        return !isNilOrError(user) ?
                          <UserName to={`/profile/${user.attributes.slug}`}>
                            {fullName}
                          </UserName>
                        :
                          <UserName to={'/'}>
                            <FormattedMessage {...messages.deletedUser} />
                          </UserName>;
                        }
                      }
                    </GetUser>
                  </User>
                  <UserScore hoverColor={barHoverColor} value={item.value}>
                    <span>{item.value}</span>
                  </UserScore>
                </UserListItem>
              ))}
            </UserList>
          }
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(MostActiveUsersChart as any) as any);
