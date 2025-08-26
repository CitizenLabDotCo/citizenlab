import { ModalId } from './modals/modalRegistry';

export interface Modal {
  modalId: ModalId;
  priority: number;
}

export interface ModalQueueState {
  queue: Modal[];
}

type ModalQueueAction =
  | { type: 'QUEUE_MODAL'; modal: Modal }
  | { type: 'REMOVE_MODAL'; modalId: ModalId };

export const initialModalQueueState: ModalQueueState = {
  queue: [],
};

const sortModalsByPriority = (modals: Modal[]): Modal[] => {
  return [...modals].sort((a, b) => b.priority - a.priority);
};

export const modalQueueReducer = (
  state: ModalQueueState,
  action: ModalQueueAction
): ModalQueueState => {
  switch (action.type) {
    case 'QUEUE_MODAL': {
      const existingModalIndex = state.queue.findIndex(
        (modal) => modal.modalId === action.modal.modalId
      );

      if (existingModalIndex >= 0) {
        return state;
      } else {
        // Add new modal
        return {
          queue: sortModalsByPriority([...state.queue, action.modal]),
        };
      }
    }

    case 'REMOVE_MODAL': {
      const filteredQueue = state.queue.filter(
        (modal) => modal.modalId !== action.modalId
      );

      return {
        queue: filteredQueue,
      };
    }

    default:
      return state;
  }
};
