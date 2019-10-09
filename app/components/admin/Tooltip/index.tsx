import React, { PureComponent } from 'react';
import Popover, { Props as PopoverProps } from 'components/admin/Popover';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

interface Props extends Omit<PopoverProps, 'onClickOutside' | 'dropdownOpened' | 'content'> {
  /** whether the tooltip should be active at all. NOT it's opened state */
  enabled: boolean;
  content: PopoverProps['content'] | null;
  className?: string;
  openDelay?: number;
}

interface State {
  opened: boolean;
  waiting: boolean;
}

const Container = styled.div`
  display: flex;
  align-items: center;

  a {
    color: ${colors.clBlueLight};
    text-decoration: underline;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;

    &:hover {
      color: ${colors.clBlueLighter};
      text-decoration: underline;
    }
  }
`;

export default class Tooltip extends PureComponent<Props, State> {
  public static defaultProps = {
    offset: '0px',
    backgroundColor: 'rgba(34, 34, 34, 0.95)',
    borderColor: '#fff',
    textColor: '#fff',
    enabled: true,
    openDelay: 100
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
      this.setState({ waiting: false });
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
    if (this.state.waiting) {
      this.setState({ opened: false, waiting: false });
    } else {
      this.setState({ waiting: true });
      setTimeout(() => {
        if (this.state.waiting) {
          this.setState({ opened: false, waiting: false });
        }
      }, 200);
    }
  }

  handleOnClick = () => {
    this.setState({ opened: !this.state.opened });
  }

  render() {
    const { opened } = this.state;
    const { enabled, children, content, className } = this.props;

    if (!enabled || !content) {
      return children;
    }

    return (
      <Container
        className={`${className} tooltip`}
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
