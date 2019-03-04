import React, { PureComponent } from 'react';
import { omit } from 'lodash-es';
import Popover, { Props as PopoverProps } from 'components/UI/Popover';
import { Omit } from 'typings';
import styled from 'styled-components';

interface Props extends Omit<PopoverProps, 'onClickOutside'|'dropdownOpened'|'content'> {
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

    render() {
      const { opened } = this.state;
      const { enabled, children, content, className } = this.props;
      const passthroughProps = omit(this.props, ['dropdownOpened', 'onClickOutside']);

      if (!enabled) {
        return children;
      }

      if (!content) {
        return children;
      }

      return (
        <Container
          className={className}
          onMouseEnter={this.handleOnMouseEnter}
          onMouseLeave={this.handleOnMouseLeave}
          onClick={this.handleOnClick}
          role="tooltip"
        >
          <Popover
            {...passthroughProps}
            content={content}
            dropdownOpened={opened}
            onClickOutside={this.handleOnMouseLeave}
          />
        </Container>
      );
    }
}
