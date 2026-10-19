import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { MenuEntry } from '../Menu/FlyoutMenu';
import messages from '../messages';
import useToast from '../Toast/useToast';

import { Destination, Placement } from './destinations';
import MoveToFlyout from './MoveToFlyout';

type Movable = {
  item: 'project' | 'folder';
  // Where it is now, sent back on Undo.
  here: Placement;
  move: (placement: Placement) => Promise<unknown>;
};

// "⋯ › Move to", for an item this user can move. A move saves at once and can
// be undone from the toast, by sending back where the item was.
const useMoveToEntry = (movable?: Movable): MenuEntry[] => {
  const { formatMessage } = useIntl();
  const toast = useToast();
  const spacesEnabled = useFeatureFlag({ name: 'spaces' });

  // Without spaces, a folder has nowhere to go.
  if (!movable || (movable.item === 'folder' && !spacesEnabled)) return [];

  const { item, here, move } = movable;
  const failed = () =>
    toast({ message: formatMessage(messages.moveNotSaved), error: true });

  const moveTo = async (destination: Destination) => {
    try {
      await move(destination.placement);
    } catch {
      failed();
      return;
    }
    toast({
      message:
        destination.kind === 'none'
          ? // Out of what it was in: a project's folder, else its space.
            formatMessage(
              here.folder_id
                ? messages.movedOutOfFolder
                : messages.movedOutOfSpace
            )
          : formatMessage(messages.movedTo, { name: destination.label }),
      undo: () => move(here).catch(failed),
    });
  };

  return [
    {
      key: 'move',
      icon: 'folder-move',
      label: formatMessage(messages.moveTo),
      flyout: (takeFocus, close) => (
        <MoveToFlyout
          item={item}
          here={here}
          takeFocus={takeFocus}
          onPick={(destination) => {
            close();
            moveTo(destination);
          }}
        />
      ),
    },
  ];
};

export default useMoveToEntry;
