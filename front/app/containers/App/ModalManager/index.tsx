import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';

import ModalRenderer from './ModalRenderer';

interface Modal {
  component: React.FC<any>;
  id: string;
}

interface ModalQueueContextType {
  queueModal: (id: string, component: React.FC<any>) => void;
  removeModal: (id: string) => void;
}

const ModalQueueContext = createContext<ModalQueueContextType | undefined>(
  undefined
);

interface ModalQueueState {
  queue: Modal[];
  currentModal: Modal | null;
}

const ModalQueueProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    (
      state: ModalQueueState,
      action:
        | { type: 'QUEUE_MODAL'; modal: Modal }
        | { type: 'REMOVE_MODAL'; modalId: string }
    ): ModalQueueState => {
      switch (action.type) {
        case 'QUEUE_MODAL': {
          return {
            ...state,
            queue: [...state.queue, action.modal],
            currentModal: action.modal,
          };
        }

        case 'REMOVE_MODAL': {
          const filteredQueue = state.queue.filter(
            (m) => m.id !== action.modalId
          );
          return {
            ...state,
            queue: filteredQueue,
            currentModal: filteredQueue[0] || null,
          };
        }

        default:
          return state;
      }
    },
    {
      queue: [],
      currentModal: null,
    }
  );

  const queueModal = useCallback((id: string, component: React.FC<any>) => {
    dispatch({
      type: 'QUEUE_MODAL',
      modal: { id, component },
    });
  }, []);

  const removeModal = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_MODAL', modalId: id });
  }, []);

  return (
    <ModalQueueContext.Provider
      value={{
        queueModal,
        removeModal,
      }}
    >
      {children}
      <ModalRenderer modal={state.currentModal} />
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
