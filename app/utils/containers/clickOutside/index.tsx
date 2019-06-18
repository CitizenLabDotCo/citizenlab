import React, { PureComponent } from 'react';

type Props = {
  children?: any;
  onClickOutside: (arg: any) => void;
  className?: string;
  onClick?: () => void;
  id?: string;
  setRef?: (arg: HTMLElement) => void;
  role?: string;
  closeOnClickOutsideEnabled?: boolean;
};

type State = {};

export default class ClickOutside extends PureComponent<Props, State> {
  container: HTMLDivElement | null = null;

  static defaultProps = {
    closeOnClickOutsideEnabled: true
  };

  componentDidMount() {
    this.addEventListeners();
  }

  componentDidUpdate(prevProps: Props) {
    if (!prevProps.closeOnClickOutsideEnabled && this.props.closeOnClickOutsideEnabled) {
      this.addEventListeners();
    }

    if (prevProps.closeOnClickOutsideEnabled && !this.props.closeOnClickOutsideEnabled) {
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
      document.addEventListener('keydown', this.handle, true);
    }
  }

  removeEventListeners = () => {
    document.removeEventListener('click', this.handle, true);
    document.removeEventListener('keydown', this.handle, true);
  }

  handle = (event) => {
    // Press esc to close
    if (event.type === 'keydown' && event.key === 'Escape') {
      event.preventDefault();
      this.props.onClickOutside(event);
    }

    // Click outside to close
    if (event.type === 'click' && this.container && !this.container.contains(event.target)) {
      setTimeout(() => {
        if (this.container) {
          this.props.onClickOutside(event);
        }
      }, 10);
    }
  }

  handleRef = (element: HTMLDivElement) => {
    this.container = element;

    if (this.props.setRef) {
      this.props.setRef(element);
    }
  }

  render() {
    const { id, role, children, className, onClick } = this.props;

    return (
      <div
        id={id}
        ref={this.handleRef}
        className={className}
        onClick={onClick}
        role={role}
      >
        {children}
      </div>
    );
  }
}
