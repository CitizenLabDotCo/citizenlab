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

// You'll need to import this function or define it here
// Assuming it sorts modals by priority (higher priority first)
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

      let newQueue: Modal[];

      if (existingModalIndex >= 0) {
        // Check if the modal is actually different before replacing
        const existingModal = state.queue[existingModalIndex];
        if (existingModal.priority === action.modal.priority) {
          // Modal is identical, return current state unchanged
          return state;
        }

        // Modal is different, so replace existing modal
        newQueue = [...state.queue];
        newQueue[existingModalIndex] = action.modal;
      } else {
        // Add new modal
        newQueue = [...state.queue, action.modal];
      }

      // Sort by priority
      const sortedQueue = sortModalsByPriority(newQueue);

      return {
        queue: sortedQueue,
      };
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
