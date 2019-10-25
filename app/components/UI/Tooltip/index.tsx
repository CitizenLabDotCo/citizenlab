import React, { PureComponent } from 'react';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import styled from 'styled-components';
import Button, { Props as ButtonProps } from 'components/UI/Button';

/* should not have button elements in content nor children */
interface Props extends Omit<PopoverProps, 'onClickOutside' | 'dropdownOpened' | 'content'> {
  /** whether the tooltip should be active at all. NOT it's opened state */
  enabled: boolean;
  content: PopoverProps['content'] | null;
  className?: string;
  openDelay?: number;
  /** If you want a button component as trigger, pass in button props as an object here*/
  buttonProps?: ButtonProps;
}

interface State {
  opened: boolean;
  waiting: boolean;
}

const Container = styled.div`
  display: inline-flexbox;
  align-items: center;
  outline: none;
  height: 100%;
`;

export default class Tooltip extends PureComponent<Props, State> {
  public static defaultProps = {
    offset: '0px',
    backgroundColor: 'white',
    borderColor: '#fff',
    textColor: '#fff',
    enabled: true,
    openDelay: 100,
    position: 'right'
  };

  constructor(props) {
    super(props);
    this.state = {
      opened: false,
      waiting: false,
    };
  }

  handleOnMouseEnter = () => {
    const { openDelay } = this.props;

    if (this.state.waiting) {
      return;
    } else {
      this.setState({ waiting: true });
      setTimeout(() => {
        if (this.state.waiting) {
          this.setState({ opened: true, waiting: false });
        }
      }, openDelay);
    }
  }

  handleOnMouseLeave = () => {
    this.setState({ waiting: false, opened: false });
  }

  handleOnClick = (event) => {
    event.preventDefault();
    this.setState({ opened: true, waiting: false });
  }

  handleOnFocus = () => {
    this.setState({ opened: true, waiting: false });
  }

  handleOnBlur = (event) => {
    if (event && event.relatedTarget && event.relatedTarget.className &&
      event.relatedTarget.className.split(' ').includes('tooltipLink')) {
      return;
    }
    this.setState({ opened: false });
  }

  render() {
    const { opened } = this.state;
    const { enabled, children, content, className, buttonProps, ...otherProps } = this.props;

    const WrappedChildren = buttonProps ? (
      <Button {...buttonProps} ariaExpanded={opened} />
    ) : (
        <button aria-expanded={opened}>
          {children}
        </button>
      );

    if (!enabled || !content) {
      return WrappedChildren;
    }

    return (
      <Container
        className={`${className || ''} tooltip`}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        onFocus={this.handleOnFocus}
        onBlur={this.handleOnBlur}
        onClick={this.handleOnClick}
        tabIndex={buttonProps && buttonProps.disabled ? 0 : undefined}
      >
        <Popover
          {...otherProps}
          children={WrappedChildren}
          content={content}
          dropdownOpened={opened}
          onClickOutside={this.handleOnMouseLeave}
        />
      </Container>
    );
  }
}
