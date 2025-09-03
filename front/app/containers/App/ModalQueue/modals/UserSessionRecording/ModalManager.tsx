import { useEffect } from 'react';

import { get } from 'js-cookie';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useModalQueue } from '../..';

const UserSessionRecordingModalManager = () => {
  const { queueModal } = useModalQueue();
  const userSessionRecodingFeatureFlag = useFeatureFlag({
    name: 'user_session_recording',
  });

  useEffect(() => {
    const shouldShowModal = () => {
      const hasSeenModal = get('user_session_recording_modal');
      const show =
        userSessionRecodingFeatureFlag &&
        hasSeenModal !== 'true' &&
        Math.random() < 0.01; // 1% chance of showing the modal
      return show;
    };

    if (shouldShowModal()) {
      queueModal('user-session-recording');
    }
  }, [userSessionRecodingFeatureFlag, queueModal]);

  return null;
};

export default UserSessionRecordingModalManager;
