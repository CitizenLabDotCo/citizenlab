import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';

import ModalRenderer from './ModalRenderer';
 import modalRegistry, { ModalId } from './modals/modalRegistry';

interface ModalQueueContextType {
  queueModal: (modalId: ModalId) => void;
  removeModal: (modalId: ModalId) => void;
}

const ModalQueueContext = createContext<ModalQueueContextType | undefined>(
  undefined
);

type Modal = {
  modalId: ModalId;
  priority: number; // Higher number means higher priority
};

interface ModalQueueState {
  queue: Modal[];
  currentModalId: ModalId | null;
}

const sortModalsByPriority = (modals: Modal[]): Modal[] => {
  return [...modals].sort((a, b) => {
    return b.priority - a.priority; // Higher priority first
  });
};

const ModalQueueProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    (
      state: ModalQueueState,
      action:
        | { type: 'QUEUE_MODAL'; modal: Modal }
        | { type: 'REMOVE_MODAL'; modalId: ModalId }
    ): ModalQueueState => {
      switch (action.type) {
        case 'QUEUE_MODAL': {

          // Sort by priority and determine current modal
          const sortedQueue = sortModalsByPriority([...state.queue, action.modal]);

          return {
            queue: sortedQueue,
            currentModalId:
              sortedQueue.length > 0 ? sortedQueue[0].modalId : null,
          };
        }

        case 'REMOVE_MODAL': {
          const filteredQueue = state.queue.filter(
            (modal) => modal.modalId !== action.modalId
          );

          return {
            queue: filteredQueue,
            currentModalId:
              filteredQueue.length > 0 ? filteredQueue[0].modalId : null,
          };
        }

        default:
          return state;
      }
    },
    {
      queue: [],
      currentModalId: null,
    }
  );

  const queueModal = useCallback((modalId: ModalId) => {
    const priority = modalRegistry[modalId].priority;

    dispatch({
      type: 'QUEUE_MODAL',
      modal: { modalId, priority },
    });
  }, []);

  const removeModal = useCallback((modalId: ModalId) => {
    dispatch({ type: 'REMOVE_MODAL', modalId });
  }, []);

  return (
    <ModalQueueContext.Provider
      value={{
        queueModal,
        removeModal,
      }}
    >
      {children}
      <ModalRenderer modalId={state.currentModalId} />
    </ModalQueueContext.Provider>
  );
};

const useModalQueue = (): ModalQueueContextType => {
  const context = useContext(ModalQueueContext);

  if (!context) {
    throw new Error('useModalQueue must be used within ModalQueueProvider');
  }

  return context;
};

export { ModalQueueProvider, useModalQueue };
