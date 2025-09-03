import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';

import { initialModalQueueState, modalQueueReducer } from './modalQueueReducer';
import ModalRenderer from './ModalRenderer';
import modalRegistry, { ModalId } from './modals/modalRegistry';

interface ModalQueueContextType {
  queueModal: (modalId: ModalId) => void;
  removeModal: (modalId: ModalId) => void;
}

const ModalQueueContext = createContext<ModalQueueContextType | undefined>(
  undefined
);

const ModalQueueProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    modalQueueReducer,
    initialModalQueueState
  );

  // Wrapping with useCallback to prevent endless re-renders
  // when we use these functions via the useModalQueue hook in a child component's useEffect for example.
  const queueModal = useCallback((modalId: ModalId) => {
    const priority = modalRegistry[modalId].priority;

    dispatch({
      type: 'QUEUE_MODAL',
      modal: { modalId, priority },
    });
  }, []);

  // Wrapping with useCallback to prevent endless re-renders
  // when we use these functions via the useModalQueue hook in a child component's useEffect for example.
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
      <div data-testid="modal-queue-provider">
        {children}
        <ModalRenderer
          modalId={state.queue.length > 0 ? state.queue[0].modalId : null}
        />
      </div>
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
