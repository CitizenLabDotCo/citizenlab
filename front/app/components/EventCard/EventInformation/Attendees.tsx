import React from 'react';

// hooks
import useAttendances from 'hooks/useAttendances';

// components

interface Props {
  eventId: string;
  attendanceCount: number;
}

const Attendees = ({ eventId, attendanceCount }) => {
  const attendances = useAttendances(eventId);

  return <></>;
};

export default Attendees;
