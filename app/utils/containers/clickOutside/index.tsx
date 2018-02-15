import * as React from 'react';

type Props = {
  children?: any;
  onClickOutside: (arg: React.FormEvent<MouseEvent>) => void;
  className?: string;
  onClick?: () => void;
  id?: string;
  setRef?: (arg: HTMLElement) => void;
};

type State = {};

export default class ClickOutside extends React.PureComponent<Props, State> {
  private container: any;

  constructor(props: Props) {
    super(props as any);
    this.container = null;
  }

  componentDidMount() {
    document.addEventListener('click', this.handle, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handle, true);
  }

  handle = (event) => {
    const { onClickOutside } = this.props;

    if (this.container && !this.container.contains(event.target)) {
      onClickOutside(event);
    }
  }

  handleRef = (element) => {
    this.container = element;

    if (this.props.setRef) {
      this.props.setRef(element);
    }
  }

  render() {
    const { children, className, onClick } = this.props;
    // tslint:disable-next-line:react-a11y-event-has-role
    return (<div id={this.props.id} ref={this.handleRef} tabIndex={0} className={className} onClick={onClick}>{children}</div>);
  }
}
