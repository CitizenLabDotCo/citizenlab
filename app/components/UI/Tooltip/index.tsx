import React, { memo, useState, useCallback } from 'react';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import styled from 'styled-components';
import Button, { Props as ButtonProps } from 'components/UI/Button';

/* should not have button elements in content nor children */
interface Props extends Omit<PopoverProps, 'onClickOutside' | 'onMouseEnter' | 'onMouseLeave' | 'dropdownOpened' | 'children' | 'content'> {
  /** whether the tooltip should be active at all. NOT it's opened state */
  enabled: boolean;
  content: PopoverProps['content'] | null;
  className?: string;
  /** If you want a button component as trigger, pass in button props as an object here*/
  buttonProps?: ButtonProps;
  children?: JSX.Element | null;
}

const Container = styled.div`
  display: inline-flexbox;
  align-items: center;
  outline: none;
  height: 100%;
`;

const Tooltip = memo<Props>(({ enabled, children, content, className, buttonProps, ...otherProps  }) => {

  const [opened, setOpened] = useState(false);

  const onPopoverMouseEnter = useCallback(() => {
    enabled && setOpened(true);
  }, []);

  const onPopoverMouseLeave = useCallback(() => {
    setOpened(false);
  }, []);

  const onPopoverClickOutside = useCallback(() => {
    setOpened(false);
  }, []);

  const WrappedChildren = buttonProps ? (
    <Button {...buttonProps} ariaExpanded={opened} />
  ) : (
    <button aria-expanded={opened}>
      {children}
    </button>
  );

  return (
    <Container
      className={`${className || ''} tooltip`}
      tabIndex={0}
    >
      <Popover
        {...otherProps}
        children={WrappedChildren}
        content={content}
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
  backgroundColor: 'white',
  borderColor: '#fff',
  textColor: '#fff',
  enabled: true,
  position: 'right'
};

(Tooltip as any).defaultProps = defaultProps;

export default Tooltip;
