import React from 'react';

// hooks
import useAttendances from 'hooks/useAttendances';

// components
import AvatarBubbles from 'components/AvatarBubbles';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  eventId: string;
  attendanceCount: number;
}

const Attendees = ({ eventId, attendanceCount }: Props) => {
  const attendances = useAttendances({ eventId, pageNumber: 1, pageSize: 4 });
  if (isNilOrError(attendances)) return null;

  const avatarIds = attendances.map(
    (attendance) => attendance.relationships.user.data.id
  );

  return (
    <>
      <AvatarBubbles avatarIds={avatarIds} userCount={attendanceCount} />
    </>
  );
};

export default Attendees;
