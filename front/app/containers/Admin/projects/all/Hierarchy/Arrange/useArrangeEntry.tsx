import React from 'react';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';

import projectFoldersMiniKeys from 'api/project_folders_mini/keys';
import projectsMiniAdminKeys from 'api/projects_mini_admin/keys';
import spacesKeys from 'api/spaces/keys';

import { useIntl } from 'utils/cl-intl';

import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';
import useToast from '../Toast/useToast';

import ArrangeFlyout from './ArrangeFlyout';
import {
  ArrangePlace,
  arrangeMoves,
  getArrangeTargets,
} from './arrangeTargets';

type Arrangeable = {
  place: ArrangePlace;
  // Sends the item to that ordering.
  reorder: (ordering: number) => Promise<unknown>;
};

// "⋯ › Arrange", for an item that has somewhere to go. Each move saves at
// once and can be undone from the toast, by sending the item back to the
// ordering it had. Nothing shows without an arrangeable item: the user may
// not move it, or what's shown isn't the order it's kept in.
const useArrangeEntry = (arrangeable?: Arrangeable): MenuEntry[] => {
  const { formatMessage } = useIntl();
  const toast = useToast();
  // Moves are worked out from the orderings on screen. While a change saves
  // and the lists reload, those are out of date, and a move would land the
  // item in the wrong place.
  const settling =
    useIsMutating() +
      useIsFetching({ queryKey: projectsMiniAdminKeys.lists() }) +
      useIsFetching({ queryKey: projectFoldersMiniKeys.lists() }) +
      useIsFetching({ queryKey: spacesKeys.lists() }) >
    0;

  if (!arrangeable || settling) return [];

  const { place, reorder } = arrangeable;
  const targets = getArrangeTargets(place);
  const moves = arrangeMoves.filter((move) => targets[move] !== undefined);
  if (moves.length === 0) return [];

  const failed = () =>
    toast({ message: formatMessage(messages.orderNotSaved), error: true });
  const from = place.orderings[place.index];

  const move = async (to: number) => {
    try {
      await reorder(to);
    } catch {
      failed();
      return;
    }
    toast({
      message: formatMessage(messages.orderSaved),
      undo: () => reorder(from).catch(failed),
    });
  };

  return [
    {
      key: 'arrange',
      icon: 'drag-handle',
      label: formatMessage(messages.arrange),
      flyout: (takeFocus, close) => (
        <ArrangeFlyout
          moves={moves}
          takeFocus={takeFocus}
          onPick={(picked) => {
            close();
            const to = targets[picked];
            if (to !== undefined) move(to);
          }}
        />
      ),
    },
  ];
};

export default useArrangeEntry;
