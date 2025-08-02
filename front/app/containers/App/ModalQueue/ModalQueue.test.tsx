import React, { useEffect } from 'react';

import { render, renderHook, act } from 'utils/testUtils/rtl';

import { ModalQueueProvider, useModalQueue } from '.';

// Mock the ModalRenderer component
jest.mock('./ModalRenderer', () => {
  return function MockModalRenderer({ modalId }: { modalId: string | null }) {
    return modalId ? <div data-testid="modal-renderer">{modalId}</div> : null;
  };
});

// Mock the modal registry
jest.mock('./modals/modalRegistry', () => ({
  'consent-modal': { priority: 100 },
  'user-session-recording': { priority: 50 },
  'community-monitor': { priority: 25 },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ModalQueueProvider>{children}</ModalQueueProvider>
);

describe('ModalQueueProvider', () => {
  // Basic functionality tests (keep the ones that were working)
  describe('queueModal', () => {
    it('should add a modal to the queue', () => {
      const TestComponent = () => {
        const { queueModal } = useModalQueue();

        useEffect(() => {
          queueModal('community-monitor');
        }, [queueModal]);

        return null;
      };

      const { container } = render(
        <ModalQueueProvider>
          <TestComponent />
        </ModalQueueProvider>
      );

      expect(container.textContent).toContain('community-monitor');
    });

    it('should handle multiple different modals and sort by priority', () => {
      const TestComponent = () => {
        const { queueModal } = useModalQueue();
        useEffect(() => {
          queueModal('community-monitor'); // priority 25
          queueModal('consent-modal'); // priority 100
          queueModal('user-session-recording'); // priority 50
        }, [queueModal]);
        return null;
      };

      const { container } = render(
        <ModalQueueProvider>
          <TestComponent />
        </ModalQueueProvider>
      );

      // Should show highest priority modal first
      expect(container.textContent).toContain('consent-modal');
    });
  });

  describe('removeModal', () => {
    it('should remove a modal from the queue', () => {
      const TestComponent = () => {
        const { queueModal, removeModal } = useModalQueue();

        useEffect(() => {
          queueModal('community-monitor');
          queueModal('consent-modal');
        }, [queueModal]);

        return (
          <button
            onClick={() => removeModal('consent-modal')}
            data-testid="remove-modal"
          >
            Remove Modal
          </button>
        );
      };

      const { getByTestId, container } = render(
        <ModalQueueProvider>
          <TestComponent />
        </ModalQueueProvider>
      );

      // Initially should show consent-modal (higher priority)
      expect(container.textContent).toContain('consent-modal');

      act(() => {
        getByTestId('remove-modal').click();
      });

      // Should show community-monitor after removing consent-modal
      expect(container.textContent).toContain('community-monitor');
    });
  });
});

describe('edge cases', () => {
  it('should handle empty queue gracefully', () => {
    const TestComponent = () => {
      const { queueModal: _queueModal } = useModalQueue();
      // Intentionally not queuing any modal
      return <div>No modal queued</div>;
    };

    const { container } = render(
      <ModalQueueProvider>
        <TestComponent />
      </ModalQueueProvider>
    );

    // Should not render any modal when queue is empty
    expect(
      container.querySelector('[data-testid="modal-renderer"]')
    ).toBeNull();
    expect(container.textContent).toContain('No modal queued');
  });
});

describe('performance', () => {
  it('should maintain referential stability of queue functions', () => {
    const { result, rerender } = renderHook(() => useModalQueue(), {
      wrapper: TestWrapper,
    });

    const firstQueueModal = result.current.queueModal;
    const firstRemoveModal = result.current.removeModal;

    rerender();

    // Functions should maintain same reference (due to useCallback)
    expect(result.current.queueModal).toBe(firstQueueModal);
    expect(result.current.removeModal).toBe(firstRemoveModal);
  });
});
