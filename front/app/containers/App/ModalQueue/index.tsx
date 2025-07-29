import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';

import ModalRenderer, { ModalId } from './ModalRenderer';

interface ModalQueueContextType {
  queueModal: (id: ModalId) => void;
  removeModal: (id: ModalId) => void;
}

const ModalQueueContext = createContext<ModalQueueContextType | undefined>(
  undefined
);

interface ModalQueueState {
  queue: ModalId[];
  currentModalId: ModalId | null;
}

const ModalQueueProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    (
      state: ModalQueueState,
      action:
        | { type: 'QUEUE_MODAL'; modalId: ModalId }
        | { type: 'REMOVE_MODAL'; modalId: ModalId }
    ): ModalQueueState => {
      switch (action.type) {
        case 'QUEUE_MODAL': {
          return {
            ...state,
            queue: [...state.queue, action.modalId],
            currentModalId: action.modalId,
          };
        }

        case 'REMOVE_MODAL': {
          const filteredQueue = state.queue.filter(
            (modalId) => modalId !== action.modalId
          );
          return {
            ...state,
            queue: filteredQueue,
            currentModalId: filteredQueue[0] || null,
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
    dispatch({
      type: 'QUEUE_MODAL',
      modalId,
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

const MODAL_PRIORITIES = {
  CRITICAL: 100,
  HIGH: 50,
  MEDIUM: 25,
  LOW: 10,
  BACKGROUND: 1,
} as const;

export { ModalQueueProvider, useModalQueue, MODAL_PRIORITIES };
