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

describe('ModalQueueProvider Integration', () => {
  it('should integrate with modal registry and render highest priority modal', () => {
    const TestComponent = () => {
      const { queueModal } = useModalQueue();

      useEffect(() => {
        // Add modals in random order to test registry integration + priority sorting
        queueModal('community-monitor'); // priority 25
        queueModal('consent-modal'); // priority 100
        queueModal('user-session-recording'); // priority 50
      }, [queueModal]);

      return null;
    };

    const { container } = render(<TestComponent />);

    // Should render highest priority modal (consent-modal)
    expect(container.textContent).toContain('consent-modal');
    expect(
      container.querySelector('[data-testid="modal-renderer"]')
    ).not.toBeNull();
  });

  it('should update rendered modal when queue changes', () => {
    const TestComponent = () => {
      const { queueModal, removeModal } = useModalQueue();

      useEffect(() => {
        queueModal('consent-modal'); // priority 100
        queueModal('community-monitor'); // priority 25
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

    const { container } = render(<TestComponent />);

    // Initially should show consent-modal (higher priority)
    expect(container.textContent).toContain('consent-modal');

    act(() => {
      getByTestId('remove-modal').click();
    });

    // Should update to show community-monitor after removing consent-modal
    expect(container.textContent).toContain('community-monitor');
    expect(container.textContent).not.toContain('consent-modal');
  });

  it('should handle empty queue gracefully', () => {
    const TestComponent = () => {
      const { queueModal: _queueModal } = useModalQueue();
      // Intentionally not queuing any modal
      return <div>No modal queued</div>;
    };

    const { container } = render(<TestComponent />);

    // Should not render any modal when queue is empty
    expect(
      container.querySelector('[data-testid="modal-renderer"]')
    ).toBeNull();
    expect(container.textContent).toContain('No modal queued');
  });

  it('should maintain function referential stability', () => {
    let hookResult;

    function TestComponent() {
      hookResult = useModalQueue();
      return null;
    }

    const { rerender } = render(<TestComponent />);

    const firstQueueModal = hookResult.queueModal;
    const firstRemoveModal = hookResult.removeModal;

    rerender(<TestComponent />);

    expect(hookResult.queueModal).toBe(firstQueueModal);
    expect(hookResult.removeModal).toBe(firstRemoveModal);
  });
});
