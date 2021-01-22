// Libraries
import React, { memo } from 'react';

// services
import { IdeaActivity } from 'services/ideas';

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

const Entry = styled.div`
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
      font-size: ${fontSizes.small}px;
    }
  }
`;

interface Props {
  activity: IdeaActivity;
  postType: 'idea' | 'initiative';
}

const ChangeLogEntry = memo<Props>(({ activity, postType }) => {
  const userId = activity.relationships.user.data.id;
  const changeLogEntryMessage =
    postType === 'idea'
      ? messages.changeLogEntryIdea
      : messages.changeLogEntryInitiative;

  return (
    <Entry className="e2e-idea-changelog-entry">
      <Avatar userId={userId} avatarSize={36} />
      <TextWrapper>
        <p>
          <FormattedMessage
            {...changeLogEntryMessage}
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
    </Entry>
  );
});

export default ChangeLogEntry;
