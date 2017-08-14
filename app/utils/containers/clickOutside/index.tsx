import * as React from 'react';

type Props = {
  children?: any;
  onClickOutside: (arg: any) => void;
  className?: string;
  onClick?: () => void;
};

type State = {};

export default class ClickOutside extends React.PureComponent<Props, State> {
  private container: any;

  constructor() {
    super();
    this.container = null;
  }

  componentDidMount() {
    document.addEventListener('click', this.handle, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handle, true);
  }

  getContainer = (ref: any) => {
    this.container = ref;
  }

  handle = (event) => {
    const { onClickOutside } = this.props;

    if (this.container && !this.container.contains(event.target)) {
      onClickOutside(event);
    }
  }

  render() {
    const { children, className, onClick } = this.props;
    return (<div ref={this.getContainer} className={className} onClick={onClick}>{children}</div>);
  }
}
