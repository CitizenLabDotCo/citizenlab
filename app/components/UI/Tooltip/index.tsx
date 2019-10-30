import React, { memo, useState, useCallback } from 'react';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import styled from 'styled-components';
import Button, { Props as ButtonProps } from 'components/UI/Button';

/* should not have button elements in content nor children */
interface Props extends Omit<PopoverProps, 'onClickOutside' | 'onMouseEnter' | 'onMouseLeave' | 'dropdownOpened' | 'children' | 'content'> {
  /** whether the tooltip should be active at all. NOT it's opened state */
  enabled?: boolean;
  content: PopoverProps['content'] | null;
  className?: string;
  /** If you want a button component as trigger, pass in button props as an object here*/
  buttonProps?: ButtonProps;
  children?: JSX.Element | null;
}

const Container = styled.div``;

const Tooltip = memo<Props>(({ enabled, children, content, className, buttonProps, ...otherProps  }) => {

  const [opened, setOpened] = useState(false);

  const onPopoverMouseEnter = useCallback(() => {
    enabled && setOpened(true);
  }, [enabled]);

  const onPopoverMouseLeave = useCallback(() => {
    setOpened(false);
  }, []);

  const onPopoverClickOutside = useCallback(() => {
    setOpened(false);
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setOpened(!opened);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpened(false);
    }
  }, [opened]);

  const removeFocus = useCallback((event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);

  const WrappedChildren = buttonProps ? (
    <Button {...buttonProps} ariaExpanded={opened} />
  ) : (
    <button aria-expanded={opened} onMouseDown={removeFocus}>
      {children}
    </button>
  );

  return (
    <Container
      className={`${className || ''} tooltip`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <Popover
        {...otherProps}
        children={WrappedChildren}
        content={content}
        delay={250}
        scaleIn={false}
        dropdownOpened={opened}
        onClickOutside={onPopoverClickOutside}
        onMouseEnter={onPopoverMouseEnter}
        onMouseLeave={onPopoverMouseLeave}
      />
    </Container>
  );
});

const defaultProps: Partial<Props> = {
  offset: 0,
  backgroundColor: '#fff',
  borderColor: '#fff',
  textColor: '#fff',
  enabled: true,
  position: 'right',
  withPin: false
};

(Tooltip as any).defaultProps = defaultProps;

export default Tooltip;
