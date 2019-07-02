import React, { PureComponent } from 'react';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import styled from 'styled-components';

interface Props extends Omit<PopoverProps, 'onClickOutside' | 'dropdownOpened' | 'content'> {
  /** whether the tooltip should be active at all. NOT it's opened state */
  enabled: boolean;
  content: PopoverProps['content'] | null;
  className?: string;
}

interface State {
  opened: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

export default class Tooltip extends PureComponent<Props, State> {

    public static defaultProps = {
      top: '0px',
      backgroundColor: 'white',
      enabled: true,
    };

    constructor(props) {
      super(props);
      this.state = {
        opened: false,
      };
    }

    handleOnMouseEnter = () => {
      this.setState({ opened: true });
    }

    handleOnMouseLeave = () => {
      this.setState({ opened: false });
    }

    handleOnClick = () => {
      this.setState({ opened: !this.state.opened });
    }

    handleOnFocus = () => {
      this.setState({ opened: true });
    }

    handleOnBlur = () => {
      this.setState({ opened: false });
    }

    render() {
      const { opened } = this.state;
      const { enabled, children, content, className } = this.props;

      if (!enabled) {
        return children;
      }

      if (!content) {
        return children;
      }

      return (
        <Container
          className={className}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          onClick={this.handleOnClick}
          role="tooltip"
        >
          <Popover
            {...this.props}
            content={content}
            dropdownOpened={opened}
            onClickOutside={this.handleOnMouseLeave}
          />
        </Container>
      );
    }
}
