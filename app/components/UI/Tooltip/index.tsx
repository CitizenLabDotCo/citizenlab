import React, { memo, useState, useCallback } from 'react';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import styled from 'styled-components';
import Button, { Props as ButtonProps } from 'components/UI/Button';
import { customOutline } from 'utils/styleUtils';

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
  const randomNumber = Math.floor(Math.random() * 10000000);
  const idName = `tooltipinfo-${randomNumber}`;

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
    if (event.key === 'Enter' && !opened) {
      event.preventDefault();
      setOpened(!opened);
    }

    if (event.key === 'Escape' && opened) {
      event.preventDefault();
      setOpened(false);
    }
  }, [opened]);

  return (
    <Container
      className={`${className || ''} tooltip`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <Popover
        {...otherProps}
        children={buttonProps ? <Button {...buttonProps} ariaDescribedby={idName} /> : <div aria-describedby={idName}>{children}</div>}
        content={<div id={idName} aria-hidden={!opened} role="tooltip">{content}</div>}
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
