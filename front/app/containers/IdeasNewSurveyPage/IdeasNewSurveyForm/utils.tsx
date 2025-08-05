import { stylingConsts } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

export function getLeaveFormDestination(
  participationMethod?: ParticipationMethod
) {
  switch (participationMethod) {
    case 'community_monitor_survey':
      return 'go-back';
    case 'native_survey':
      return 'project-page';
    default:
      return 'project-page';
  }
}

export function calculateDynamicHeight(isSmallerThanPhone: boolean) {
  const viewportHeight = window.innerHeight;
  const menuHeight = stylingConsts.menuHeight;
  const mobileTopBarHeight = stylingConsts.mobileTopBarHeight;
  const extraSpace = 80;

  const dynamicHeight =
    viewportHeight -
    (isSmallerThanPhone ? mobileTopBarHeight : menuHeight) -
    extraSpace;

  return `${dynamicHeight}px`;
}
