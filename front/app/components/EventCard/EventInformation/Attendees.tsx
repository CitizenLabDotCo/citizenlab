import React from 'react';
import styled from 'styled-components';

// hooks
import useAttendances from 'hooks/useAttendances';

// components
import Button from 'components/UI/Button';
import AvatarBubbles from 'components/AvatarBubbles';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  justify-content: spacing-between;
`;

interface Props {
  eventId: string;
  attendanceCount: number;
}

const Attendees = ({ eventId, attendanceCount }: Props) => {
  const attendances = useAttendances({ eventId, pageNumber: 1, pageSize: 4 });
  if (isNilOrError(attendances)) return null;

  const attendanceIds = attendances.map(
    (attendance) => attendance.relationships.user.data.id
  );

  return (
    <Container>
      <Button>Attend</Button>
      <AvatarBubbles avatarIds={attendanceIds} userCount={attendanceCount} />
    </Container>
  );
};

export default Attendees;
