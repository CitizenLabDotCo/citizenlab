// libraries
import React, { PureComponent } from 'react';

// components
import DesktopNavbar from './DesktopNavbar';

interface Props {
  setRef?: (arg: HTMLElement) => void | undefined;
}

class Navbar extends PureComponent<Props> {
  constructor(props) {
    super(props);
  }

  handleRef = (element: HTMLElement) => {
    this.props.setRef && this.props.setRef(element);
  };

  render() {
    return <DesktopNavbar />;
  }
}

export default Navbar;
