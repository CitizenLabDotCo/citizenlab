import React, { useMemo } from 'react';
import styled from 'styled-components';

// styling
import { media } from 'utils/styleUtils';

// services
import { attendEvent, unAttendEvent, IAttendance } from 'services/attendances';
import { IUserData } from 'services/users';

// hooks
import useAttendances from 'hooks/useAttendances';
import useAuthUser from 'hooks/useAuthUser';

// components
import Button from 'components/UI/Button';
import AvatarBubbles from 'components/AvatarBubbles';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  align-items: center;

  ${media.smallerThanMinTablet`
    flex-direction: column-reverse;
  `}
`;

const StyledButton = styled(Button)`
  ${media.smallerThanMinTablet`
    margin-bottom: 15px;
  `}
`;

interface Props {
  eventId: string;
}

const Attendees = ({ eventId }: Props) => {
  const attendances = useAttendances({ eventId });
  const user = useAuthUser();

  const attendanceIds = useMemo(() => {
    if (isNilOrError(attendances)) return [];

    return attendances
      .slice(0, 4)
      .map((attendance) => attendance.relationships.user.data.id);
  }, [attendances]);

  const loggedIn = !isNilOrError(user);

  const userAttendanceId = useMemo(() => {
    return loggedIn && !isNilOrError(attendances)
      ? getAttendanceId(attendances, user)
      : null;
  }, [loggedIn, attendances]);

  if (isNilOrError(attendances)) return null;

  const handleClickAttendButton = () => {
    if (!loggedIn) return;

    if (userAttendanceId) {
      unAttendEvent(userAttendanceId);
    } else {
      attendEvent(eventId);
    }
  };

  return (
    <Container>
      {attendanceIds.length > 0 ? (
        <AvatarBubbles
          avatarIds={attendanceIds}
          userCount={attendanceIds.length}
        />
      ) : (
        <FormattedMessage {...messages.noAttendances} />
      )}

      {loggedIn && (
        <StyledButton
          onClick={handleClickAttendButton}
          buttonStyle={userAttendanceId ? 'secondary' : 'primary'}
        >
          {userAttendanceId ? (
            <FormattedMessage {...messages.unAttend} />
          ) : (
            <FormattedMessage {...messages.attend} />
          )}
        </StyledButton>
      )}
    </Container>
  );
};

export default Attendees;

function getAttendanceId(attendances: IAttendance[], user: IUserData) {
  const userId = user.id;

  const userAttendance = attendances.find(
    (attendance) => userId === attendance.relationships.user.data.id
  );

  if (userAttendance) {
    return userAttendance.id;
  }

  return null;
}
