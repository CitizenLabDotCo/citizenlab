import React, { useEffect, useRef, MouseEvent, useCallback } from 'react';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handle = useCallback(
    (event: any) => {
      // Press esc to close
      if (event.type === 'keyup' && event.key === 'Escape') {
        event.preventDefault();
        onClickOutside(event);
      }

      if (
        event.type === 'keyup' &&
        event.key === 'Tab' &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClickOutside(event);
      }

      // Click outside to close
      if (
        event.type === 'click' &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onClickOutside(event);
      }
    },
    [onClickOutside]
  );

  useEffect(() => {
    if (closeOnClickOutsideEnabled) {
      document.addEventListener('click', handle, true);
      document.addEventListener('keyup', handle, true);
    }

    return () => {
      document.removeEventListener('click', handle, true);
      document.removeEventListener('keyup', handle, true);
    };
  }, [closeOnClickOutsideEnabled, handle]);

  const handleRef = (element: HTMLDivElement) => {
    containerRef.current = element;
    setRef && setRef(element);
  };

  const handleOnMouseEnter = (event: MouseEvent) => {
    onMouseEnter && onMouseEnter(event);
  };

  const handleOnMouseLeave = (event: MouseEvent) => {
    onMouseLeave && onMouseLeave(event);
  };

  const handleOnMouseDown = (event: MouseEvent) => {
    onMouseDown && onMouseDown(event);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      id={id}
      ref={handleRef}
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
