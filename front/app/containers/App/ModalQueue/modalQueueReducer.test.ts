// modalQueueReducer.test.ts
import { modalQueueReducer, Modal, ModalQueueState } from './modalQueueReducer';

describe('modalQueueReducer', () => {
  let initialModalQueueState: ModalQueueState;

  beforeEach(() => {
    initialModalQueueState = { queue: [] };
  });

  describe('QUEUE_MODAL', () => {
    it('should add a new modal to empty queue', () => {
      const modal: Modal = { modalId: 'community-monitor', priority: 25 };
      const action = { type: 'QUEUE_MODAL' as const, modal };

      const newState = modalQueueReducer(initialModalQueueState, action);

      expect(newState.queue).toHaveLength(1);
      expect(newState.queue[0]).toEqual(modal);
    });

    it('should add multiple modals and sort by priority (higher first)', () => {
      const modal1: Modal = { modalId: 'community-monitor', priority: 25 };
      const modal2: Modal = { modalId: 'consent-modal', priority: 100 };
      const modal3: Modal = { modalId: 'user-session-recording', priority: 50 };

      let state = modalQueueReducer(initialModalQueueState, {
        type: 'QUEUE_MODAL',
        modal: modal1,
      });
      state = modalQueueReducer(state, { type: 'QUEUE_MODAL', modal: modal2 });
      state = modalQueueReducer(state, { type: 'QUEUE_MODAL', modal: modal3 });

      expect(state.queue).toHaveLength(3);
      expect(state.queue[0]).toEqual(modal2); // consent-modal, priority 100
      expect(state.queue[1]).toEqual(modal3); // user-session-recording, priority 50
      expect(state.queue[2]).toEqual(modal1); // community-monitor, priority 25
    });

    // This test ensures that the reducer does not mutate the state,
    // and causes endless re-renders if the useModalQueue hook is used in a component's useEffect.
    it('should return the same state object when adding identical modal (referential equality)', () => {
      const state = modalQueueReducer(initialModalQueueState, {
        type: 'QUEUE_MODAL',
        modal: { modalId: 'consent-modal', priority: 100 },
      });

      // Try to add the same modal again
      const newState = modalQueueReducer(state, {
        type: 'QUEUE_MODAL',
        modal: { modalId: 'consent-modal', priority: 100 },
      });

      // Should return the exact same state object (referential equality)
      expect(newState).toBe(state);
      expect(newState.queue).toHaveLength(1);
    });

    it('should not mutate the original state', () => {
      const modal: Modal = { modalId: 'consent-modal', priority: 100 };
      const originalState: ModalQueueState = { queue: [] };

      const newState = modalQueueReducer(originalState, {
        type: 'QUEUE_MODAL',
        modal,
      });

      expect(originalState.queue).toHaveLength(0); // Original state unchanged
      expect(newState.queue).toHaveLength(1);
      expect(newState).not.toBe(originalState); // Different object reference
    });
  });

  describe('REMOVE_MODAL', () => {
    it('should remove modal from queue', () => {
      const modal1: Modal = { modalId: 'community-monitor', priority: 25 };
      const modal2: Modal = { modalId: 'consent-modal', priority: 100 };

      let state = modalQueueReducer(initialModalQueueState, {
        type: 'QUEUE_MODAL',
        modal: modal1,
      });
      state = modalQueueReducer(state, { type: 'QUEUE_MODAL', modal: modal2 });

      const newState = modalQueueReducer(state, {
        type: 'REMOVE_MODAL',
        modalId: 'community-monitor',
      });

      expect(newState.queue).toHaveLength(1);
      expect(newState.queue[0]).toEqual(modal2);
    });

    it('should handle removing non-existent modal gracefully', () => {
      const modal: Modal = { modalId: 'consent-modal', priority: 100 };
      const state = modalQueueReducer(initialModalQueueState, {
        type: 'QUEUE_MODAL',
        modal,
      });

      // Try to remove a modal that's not in the queue
      const newState = modalQueueReducer(state, {
        type: 'REMOVE_MODAL',
        modalId: 'user-session-recording',
      });

      expect(newState.queue).toHaveLength(1);
      expect(newState.queue[0]).toEqual(modal);
    });

    it('should return empty queue when removing last modal', () => {
      const modal: Modal = { modalId: 'consent-modal', priority: 100 };
      let state = modalQueueReducer(initialModalQueueState, {
        type: 'QUEUE_MODAL',
        modal,
      });

      state = modalQueueReducer(state, {
        type: 'REMOVE_MODAL',
        modalId: 'consent-modal',
      });

      expect(state.queue).toHaveLength(0);
    });

    it('should not mutate the original state', () => {
      const modal: Modal = { modalId: 'consent-modal', priority: 100 };
      const originalState = modalQueueReducer(initialModalQueueState, {
        type: 'QUEUE_MODAL',
        modal,
      });

      const newState = modalQueueReducer(originalState, {
        type: 'REMOVE_MODAL',
        modalId: 'consent-modal',
      });

      expect(originalState.queue).toHaveLength(1); // Original state unchanged
      expect(newState.queue).toHaveLength(0);
      expect(newState).not.toBe(originalState); // Different object reference
    });
  });
});
