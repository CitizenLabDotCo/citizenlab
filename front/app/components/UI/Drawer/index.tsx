import React, { useEffect, useState } from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import styled from 'styled-components';

import { DragArea, DragHandle } from './primitives';
import useSheetDrag from './useSheetDrag';

const TRANSITION_MS = 250;

type Status = 'closed' | 'opening' | 'open' | 'closing';

const Overlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity ${TRANSITION_MS}ms ease-out;
  /* Same layer as the regular modal stack. */
  z-index: 1000001;
`;

const Sheet = styled.div<{ $translateY: string; $isDragging: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  max-height: 85dvh;
  background: ${colors.white};
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(${({ $translateY }) => $translateY});
  transition: ${({ $isDragging }) =>
    $isDragging ? 'none' : `transform ${TRANSITION_MS}ms ease-out`};
`;

const Content = styled.div`
  overflow-y: auto;
  padding: 8px 16px;
  padding-bottom: max(24px, env(safe-area-inset-bottom));
`;

type Props = {
  opened: boolean;
  onClose: () => void;
  ariaLabel?: string;
  header?: React.ReactNode;
  children: React.ReactNode;
};

const Drawer = ({ opened, onClose, ariaLabel, header, children }: Props) => {
  const [status, setStatus] = useState<Status>('closed');

  useEffect(() => {
    if (opened) {
      setStatus('opening');
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setStatus('open'))
      );
      return () => cancelAnimationFrame(raf);
    }

    setStatus((current) => (current === 'closed' ? current : 'closing'));
    const timer = setTimeout(() => setStatus('closed'), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [opened]);

  const { dragOffset, isDragging, dragHandlers } = useSheetDrag({
    clampOffset: (delta) => Math.max(0, delta),
    onSwipeDown: onClose,
  });

  useEffect(() => {
    if (!opened) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [opened, onClose]);

  if (status === 'closed') return null;

  const visible = status === 'open';
  const translateY = isDragging
    ? `${dragOffset ?? 0}px`
    : visible
    ? '0'
    : '100%';

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };

  const modalPortalElement = document.getElementById('modal-portal');
  if (!modalPortalElement) return null;

  return createPortal(
    <FocusOn enabled={visible} autoFocus returnFocus scrollLock>
      <Overlay $visible={visible} onClick={handleOverlayClick}>
        <Sheet
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          $translateY={translateY}
          $isDragging={isDragging}
        >
          <DragArea {...dragHandlers}>
            <DragHandle aria-hidden="true" />
          </DragArea>
          {header}
          <Content>{children}</Content>
        </Sheet>
      </Overlay>
    </FocusOn>,
    modalPortalElement
  );
};

export default Drawer;
