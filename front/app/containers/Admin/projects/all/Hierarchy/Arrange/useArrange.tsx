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

type Arrange = {
  // "⋯ › Arrange", when the item has somewhere to go.
  entries: MenuEntry[];
  // Sends the item to the place of the item at that ordering, as a drop in
  // that item's place does. It says whether the move saved.
  arrangeTo?: (ordering: number) => Promise<boolean>;
};

// Moving an item among the ones beside it, from its "⋯" or by dragging it.
// Each move saves at once and can be undone from the toast, by sending the
// item back to the ordering it had. Nothing can move without an arrangeable
// item: the user may not move it, or what's shown isn't the order it's kept
// in.
const useArrange = (arrangeable?: Arrangeable): Arrange => {
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

  if (!arrangeable || settling) return { entries: [] };

  const { place, reorder } = arrangeable;
  const targets = getArrangeTargets(place);
  const moves = arrangeMoves.filter((move) => targets[move] !== undefined);
  if (moves.length === 0) return { entries: [] };

  const failed = () =>
    toast({ message: formatMessage(messages.orderNotSaved), error: true });
  const from = place.orderings[place.index];

  const arrangeTo = async (to: number) => {
    try {
      await reorder(to);
    } catch {
      failed();
      return false;
    }
    toast({
      message: formatMessage(messages.orderSaved),
      undo: () => reorder(from).catch(failed),
    });
    return true;
  };

  return {
    arrangeTo,
    entries: [
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
              if (to !== undefined) arrangeTo(to);
            }}
          />
        ),
      },
    ],
  };
};

export default useArrange;
