import { IconNames } from '@citizenlab/cl2-component-library';

import { Visibility } from 'api/projects/types';

import { MessageDescriptor } from 'utils/cl-intl';

import messages from '../messages';

export interface VisibilityOption<T extends string> {
  value: T;
  icon: IconNames;
  label: MessageDescriptor;
  description: MessageDescriptor;
}

export type Listed = 'listed' | 'unlisted';

export const FIND_OPTIONS: VisibilityOption<Listed>[] = [
  {
    value: 'listed',
    icon: 'eye',
    label: messages.publishFindPublic,
    description: messages.publishFindPublicDescription,
  },
  {
    value: 'unlisted',
    icon: 'eye-off',
    label: messages.publishFindPrivate,
    description: messages.publishFindPrivateDescription,
  },
];

export const OPEN_OPTIONS: VisibilityOption<Visibility>[] = [
  {
    value: 'public',
    icon: 'users',
    label: messages.publishOpenEveryone,
    description: messages.publishOpenEveryoneDescription,
  },
  {
    value: 'admins',
    icon: 'lock',
    label: messages.publishOpenAdmins,
    description: messages.publishOpenAdminsDescription,
  },
  {
    value: 'groups',
    icon: 'lock',
    label: messages.publishOpenGroups,
    description: messages.publishOpenGroupsDescription,
  },
];
