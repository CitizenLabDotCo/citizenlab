// Libraries
import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IdeaActivity } from 'services/ideas';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// Components
import UserName from 'components/UI/UserName';
import Avatar from 'components/Avatar';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const ChangeLogEntry = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 10px;

  p {
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    margin: 0;

    &:last-child {
      color: ${colors.label};
      font-size: ${fontSizes.small}px
    }
  }
`;

interface InputProps {
  activity: IdeaActivity;
}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

const ActivityChangeLog = memo<Props>(({ activity, user }) => {
  const userId = activity.relationships.user.data.id;

  return (
    <ChangeLogEntry className="e2e-activities-changelog-entry">
      <Avatar userId={userId} size="36px" />
      <TextWrapper>
        <p>
          <FormattedMessage
            {...messages.changeLogEntry}
            values={{
              userName: <UserName userId={userId} />,
              changeType: activity.attributes.action,
            }}
          />
        </p>
        <p>
          <FormattedDate
            value={activity.attributes.acted_at}
            year="numeric"
            month="2-digit"
            day="2-digit"
          />
          &nbsp;
          <FormattedTime
            value={activity.attributes.acted_at}
            hour="2-digit"
            minute="2-digit"
          />
        </p>
      </TextWrapper>
    </ChangeLogEntry>
  );
});

const Data = adopt<DataProps, InputProps>({
  user: ({ activity, render }) => <GetUser id={get(activity, 'relationships.user.data.id')}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ActivityChangeLog {...inputProps} {...dataProps} />}
  </Data>
);
