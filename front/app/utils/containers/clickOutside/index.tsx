import React, { useEffect, useRef, MouseEvent } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

type Props = {
  children?: any;
  onClick?: (event: MouseEvent) => void;
  onClickOutside: (event: Event) => void;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onMouseDown?: (event: MouseEvent) => void;
  className?: string;
  id?: string;
  setRef?: (arg: HTMLElement) => void;
  role?: string;
  closeOnClickOutsideEnabled?: boolean;
  isModal?: boolean;
  ariaLabelledBy?: string;
};

const ClickOutside = ({
  children,
  onClick,
  onClickOutside,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  className,
  id,
  setRef,
  role,
  closeOnClickOutsideEnabled = true,
  isModal,
  ariaLabelledBy,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (event: Event) => {
      // Press esc to close
      if (event.type === 'keyup' && (event as KeyboardEvent).key === 'Escape') {
        event.preventDefault();
        onClickOutside(event);
      }

      if (
        event.type === 'keyup' &&
        (event as KeyboardEvent).key === 'Tab' &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickOutside(event);
      }

      // Click outside to close
      if (
        event.type === 'click' &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickOutside(event);
      }
    };

    const addEventListeners = () => {
      if (closeOnClickOutsideEnabled) {
        document.addEventListener('click', handle, true);
        document.addEventListener('keyup', handle, true);
      }
    };

    const removeEventListeners = () => {
      document.removeEventListener('click', handle, true);
      document.removeEventListener('keyup', handle, true);
    };

    addEventListeners();
    return () => removeEventListeners();
  }, [closeOnClickOutsideEnabled, onClickOutside]);

  useEffect(() => {
    if (setRef && containerRef.current) {
      setRef(containerRef.current);
    }
  }, [setRef]);

  const handleOnMouseEnter = (event: MouseEvent) => {
    onMouseEnter?.(event);
  };

  const handleOnMouseLeave = (event: MouseEvent) => {
    onMouseLeave?.(event);
  };

  const handleOnMouseDown = (event: MouseEvent) => {
    onMouseDown?.(event);
  };

  return (
    <Box
      id={id}
      ref={containerRef}
      className={className}
      onClick={onClick}
      onMouseEnter={handleOnMouseEnter}
      onMouseLeave={handleOnMouseLeave}
      onMouseDown={handleOnMouseDown}
      role={role}
      aria-modal={isModal}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </Box>
  );
};

export default ClickOutside;
