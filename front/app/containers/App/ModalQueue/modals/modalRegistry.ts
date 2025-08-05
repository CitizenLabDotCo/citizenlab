import { lazy } from 'react';

import AuthenticationModal from 'containers/Authentication/Modal';

const ConsentManagerModal = lazy(
  () => import('components/ConsentManager/ConsentManagerModal')
);
const UserSessionRecordingModal = lazy(
  () => import('./UserSessionRecording/Modal')
);
const CommunityMonitorModal = lazy(() => import('./CommunityMonitor/Modal'));

const MODAL_PRIORITIES = {
  100: 'CRITICAL',
  50: 'HIGH',
  25: 'MEDIUM',
  10: 'LOW',
  1: 'BACKGROUND',
} as const;

type ModalPriority = keyof typeof MODAL_PRIORITIES;

export type ModalId =
  | 'consent-modal'
  | 'user-session-recording'
  | 'community-monitor'
  | 'authentication';

const modalRegistry: Record<
  ModalId,
  { component: React.FC<any>; priority: ModalPriority }
> = {
  'consent-modal': {
    component: ConsentManagerModal,
    priority: 100,
  },
  'user-session-recording': {
    component: UserSessionRecordingModal,
    priority: 50,
  },
  authentication: {
    component: AuthenticationModal,
    priority: 25,
  },
  // This community-monitor modal probably needs to get a lower priority
  'community-monitor': {
    component: CommunityMonitorModal,
    priority: 25,
  },
};

export default modalRegistry;
