import React, { useEffect, useRef, MouseEvent } from 'react';

type Props = {
  children?: any;
  onClick?: (event: MouseEvent) => void;
  onClickOutside: (event: MouseEvent) => void;
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
    const handle = (event: PointerEvent | MouseEvent | KeyboardEvent) => {
      // Press esc to close
      if (event.type === 'keyup' && (event as KeyboardEvent).key === 'Escape') {
        event.preventDefault();
        onClickOutside(event as MouseEvent);
      }

      if (
        event.type === 'keyup' &&
        (event as KeyboardEvent).key === 'Tab' &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickOutside(event as MouseEvent);
      }

      // Click outside to close
      if (
        event.type === 'click' &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClickOutside(event as MouseEvent);
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
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
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
    </div>
  );
};

export default ClickOutside;
