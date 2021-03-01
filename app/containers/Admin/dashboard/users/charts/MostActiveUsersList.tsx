import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { get, max } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import Link from 'utils/cl-router/Link';

// components
import {
  NoDataContainer,
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from '../..';
import { Popup } from 'semantic-ui-react';
import { Icon } from 'cl2-component-library';
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
import {
  userEngagementScoresStream,
  IUserEngagementScore,
} from 'services/stats';

// resources
import GetUser from 'resources/GetUser';

const InfoIcon = styled(Icon)`
  display: flex;
  align-items: center;
  cursor: pointer;
  width: 20px;
  height: 22px;
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
  min-width: 50%;
  align-items: center;

  ${media.smallerThan1280px`
    max-width: 70%;
    min-width: 70%;
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

const DeletedUserName = styled.span`
  font-style: italic;
`;

interface IUserScoreComponent {
  hoverColor: string;
  value: number;
}

const UserScore = styled.div<IUserScoreComponent>`
  background-color: ${(props) => props.theme.newBarFill};
  width: ${(props) => props.value * 50}%;
  color: #fff;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: ${(props: any) => props.hoverColor};
    color: ${(props) => props.theme.newBarFill};
  }

  ${media.smallerThan1280px`
    width: ${(props) => props.value * 4}px;
  `}
`;

interface Props {
  className?: string;
  infoMessage?: string;
  startAt: string | null | undefined;
  endAt: string | null;
  currentGroupFilter: string | undefined;
}

interface State {
  engagementScoreList: IUserEngagementScore[] | null;
}

class MostActiveUsersList extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  subscription: Subscription;

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      engagementScoreList: null,
    };
  }

  componentDidMount() {
    this.resubscribe();
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props.startAt !== prevProps.startAt ||
      this.props.endAt !== prevProps.endAt ||
      this.props.currentGroupFilter !== prevProps.currentGroupFilter
    ) {
      this.resubscribe(
        this.props.startAt,
        this.props.endAt,
        this.props.currentGroupFilter
      );
    }
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
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
        group: currentGroupFilter,
      },
    }).observable.subscribe((response) => {
      const engagementScoreList = response.data;
      this.setState({ engagementScoreList });
    });
  }

  formatName = (firstName: string, lastName: string) => {
    let fullName = `${firstName} ${lastName}`;

    // Add ellipsis to name if it's too long
    if (fullName.length > 20) {
      fullName = `${fullName.slice(0, 22)}...`;
    }

    return fullName;
  };

  maxScore = () => {
    const { engagementScoreList } = this.state;
    if (engagementScoreList) {
      return max(engagementScoreList.map((item) => item.attributes.sum_score));
    } else {
      return undefined;
    }
  };

  render() {
    const { className, infoMessage } = this.props;
    const { engagementScoreList } = this.state;
    const theme = this.props['theme'];
    const { newBarFill } = theme;
    const barHoverColor = rgba(newBarFill, 0.25);
    const maxScore = this.maxScore() || 0;

    return (
      <GraphCard className={className}>
        <GraphCardInner>
          <GraphCardHeader>
            <GraphCardTitle>
              <FormattedMessage {...messages.mostActiveUsers} />
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
          </GraphCardHeader>
          {!engagementScoreList || engagementScoreList.length === 0 ? (
            <NoDataContainer>
              <FormattedMessage {...messages.noData} />
            </NoDataContainer>
          ) : (
            <UserList>
              {engagementScoreList.map((item) => {
                const itemId = item.id;
                const userId = item.relationships.user.data.id;
                const userScore = item.attributes.sum_score;

                return (
                  <UserListItem key={itemId}>
                    <User>
                      <UserImage size={28} userId={userId} />
                      <GetUser id={userId}>
                        {(user) => {
                          const firstName: string = get(
                            user,
                            'attributes.first_name',
                            ''
                          );
                          const lastName: string = get(
                            user,
                            'attributes.last_name',
                            ''
                          );
                          const fullName = this.formatName(firstName, lastName);

                          return !isNilOrError(user) ? (
                            <UserName to={`/profile/${user.attributes.slug}`}>
                              {fullName}
                            </UserName>
                          ) : (
                            <DeletedUserName>
                              <FormattedMessage {...messages.deletedUser} />
                            </DeletedUserName>
                          );
                        }}
                      </GetUser>
                    </User>
                    <UserScore
                      hoverColor={barHoverColor}
                      value={userScore / maxScore}
                    >
                      {userScore}
                    </UserScore>
                  </UserListItem>
                );
              })}
            </UserList>
          )}
        </GraphCardInner>
      </GraphCard>
    );
  }
}

export default injectIntl<Props>(withTheme(MostActiveUsersList as any) as any);
