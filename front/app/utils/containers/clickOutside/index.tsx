import React, { PureComponent } from 'react';

type Props = {
  children?: any;
  onClick?: (event) => void;
  onClickOutside: (event) => void;
  onMouseEnter?: (event) => void;
  onMouseLeave?: (event) => void;
  onMouseDown?: (event) => void;
  className?: string;
  id?: string;
  setRef?: (arg: HTMLElement) => void;
  role?: string;
  closeOnClickOutsideEnabled?: boolean;
  isModal?: boolean;
  ariaLabelledBy?: string;
};

interface State {}

export default class ClickOutside extends PureComponent<Props, State> {
  container: HTMLDivElement | null = null;

  static defaultProps = {
    closeOnClickOutsideEnabled: true,
  };

  componentDidMount() {
    this.addEventListeners();
  }

  componentDidUpdate(prevProps: Props) {
    if (
      !prevProps.closeOnClickOutsideEnabled &&
      this.props.closeOnClickOutsideEnabled
    ) {
      this.addEventListeners();
    }

    if (
      prevProps.closeOnClickOutsideEnabled &&
      !this.props.closeOnClickOutsideEnabled
    ) {
      this.removeEventListeners();
    }
  }

  componentWillUnmount() {
    this.container = null;
    this.removeEventListeners();
  }

  addEventListeners = () => {
    if (this.props.closeOnClickOutsideEnabled) {
      document.addEventListener('click', this.handle, true);
      document.addEventListener('keyup', this.handle, true);
    }
  };

  removeEventListeners = () => {
    document.removeEventListener('click', this.handle, true);
    document.removeEventListener('keyup', this.handle, true);
  };

  handle = (event) => {
    // Press esc to close
    if (event.type === 'keyup' && event.key === 'Escape') {
      event.preventDefault();
      this.props.onClickOutside(event);
    }

    if (
      event.type === 'keyup' &&
      event.key === 'Tab' &&
      this.container &&
      !this.container.contains(event.target)
    ) {
      this.props.onClickOutside(event);
    }

    // Click outside to close
    if (
      event.type === 'click' &&
      this.container &&
      !this.container.contains(event.target)
    ) {
      setTimeout(() => {
        if (this.container) {
          this.props.onClickOutside(event);
        }
      }, 10);
    }
  };

  handleRef = (element: HTMLDivElement) => {
    this.container = element;
    this.props.setRef && this.props.setRef(element);
  };

  handleOnMouseEnter = (event) => {
    this.props.onMouseEnter && this.props.onMouseEnter(event);
  };

  handleOnMouseLeave = (event) => {
    this.props.onMouseLeave && this.props.onMouseLeave(event);
  };

  handleOnMouseDown = (event) => {
    this.props.onMouseDown && this.props.onMouseDown(event);
  };

  render() {
    const { id, role, children, className, onClick, isModal, ariaLabelledBy } =
      this.props;

    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        id={id}
        ref={this.handleRef}
        className={className}
        onClick={onClick}
        onMouseEnter={this.handleOnMouseEnter}
        onMouseLeave={this.handleOnMouseLeave}
        onMouseDown={this.handleOnMouseDown}
        role={role}
        aria-modal={isModal}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </div>
    );
  }
}
