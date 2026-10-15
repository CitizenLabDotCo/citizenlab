import { useMemo } from 'react';

import { IRelationship } from 'typings';

import { IUserData } from 'api/users/types';

import { indexById } from 'utils/cl-react-query/indexById';

import ManagerBubbles from '../../_shared/ManagerBubbles';

export type Managers = React.ComponentProps<typeof ManagerBubbles>['managers'];

const isUser = (resource: { type: string }): resource is IUserData =>
  resource.type === 'user';

// Lists send their items' managers once, as included users; this looks each
// item's managers up by id.
const useManagers = (included: { id: string; type: string }[] | undefined) => {
  const usersById = useMemo(
    () => indexById((included ?? []).filter(isUser)),
    [included]
  );

  return (moderators: IRelationship[]): Managers =>
    moderators.flatMap(({ id }) => {
      // A manager whose user wasn't included is left out rather than shown blank.
      if (!(id in usersById)) return [];

      const { first_name, last_name, avatar } = usersById[id].attributes;
      return [
        {
          first_name: first_name ?? undefined,
          last_name: last_name ?? undefined,
          avatar,
        },
      ];
    });
};

export default useManagers;
