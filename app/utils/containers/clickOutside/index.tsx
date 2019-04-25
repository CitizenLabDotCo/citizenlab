import React, { PureComponent } from 'react';

type Props = {
  children?: any;
  onClickOutside: (arg: any) => void;
  className?: string;
  onClick?: () => void;
  id?: string;
  setRef?: (arg: HTMLElement) => void;
};

type State = {};

export default class ClickOutside extends PureComponent<Props, State> {
  container: HTMLDivElement | null = null;

  componentDidMount() {
    document.addEventListener('click', this.handle, true);
    document.addEventListener('keydown', this.handle, true);
  }

  componentWillUnmount() {
    this.container = null;
    document.removeEventListener('click', this.handle, true);
    document.removeEventListener('keydown', this.handle, true);
  }

  handle = (event) => {
    console.log(1);

    // if (!event.defaultPrevented) {
      console.log(2);

      event.preventDefault();

      if (event.type === 'keydown' && event.key === 'Escape') {
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
    // }
  }

  handleRef = (element: HTMLDivElement) => {
    this.container = element;

    if (this.props.setRef) {
      this.props.setRef(element);
    }
  }

  render() {
    const { children, className, onClick } = this.props;
    // tslint:disable-next-line:react-a11y-event-has-role
    return (<div id={this.props.id} ref={this.handleRef} className={className} onClick={onClick}>{children}</div>);
  }
}
