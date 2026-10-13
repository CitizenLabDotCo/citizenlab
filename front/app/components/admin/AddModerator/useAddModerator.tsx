import React, { Suspense, useState } from 'react';

import checkIfUserExceedsSeats from 'api/users/checkIfUserExceedsSeats';

import SeatLimitReachedModal from '../SeatBasedBilling/SeatLimitReachedModal';

export type UserParams = {
  user_id?: string;
  user_email?: string;
};

// Adding a manager can go over the plan's seats. In that case we ask first,
// through the modal this hook returns, before adding them.
const useAddModerator = (
  onAddModerator: (params: UserParams) => Promise<void>
) => {
  const [pendingParams, setPendingParams] = useState<UserParams | null>(null);

  const addModerator = async (params: UserParams) => {
    const exceedsSeats = await checkIfUserExceedsSeats({
      ...params,
      seat_type: 'moderator',
    });

    if (exceedsSeats) {
      setPendingParams(params);
    } else {
      await onAddModerator(params);
    }
  };

  const seatLimitModal = (
    <Suspense fallback={null}>
      <SeatLimitReachedModal
        seatType="moderator"
        addModerators={() => {
          if (pendingParams === null) return;
          onAddModerator(pendingParams);
        }}
        showModal={!!pendingParams}
        closeModal={() => setPendingParams(null)}
      />
    </Suspense>
  );

  return { addModerator, seatLimitModal };
};

export default useAddModerator;
