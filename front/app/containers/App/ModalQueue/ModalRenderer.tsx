import React, { lazy } from 'react';

const ConsentManagerModal = lazy(
  () => import('components/ConsentManager/ConsentManagerModal')
);
const UserSessionRecordingModal = lazy(
  () => import('./modals/UserSessionRecording/Modal')
);

export type ModalId = 'consent-modal' | 'user-session-recording';

const modalRegistry: Record<ModalId, React.FC<any>> = {
  'consent-modal': ConsentManagerModal,
  'user-session-recording': UserSessionRecordingModal,
};

const ModalRenderer = ({ modalId }: { modalId: ModalId | null }) => {
  if (!modalId) return null;
  const ModalComponent = modalRegistry[modalId];

  return <ModalComponent />;
};

export default ModalRenderer;
