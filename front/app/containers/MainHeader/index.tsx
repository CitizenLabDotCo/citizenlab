// libraries
import React, { PureComponent } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import MobileNavbar from './components/MobileNavbar';
import DesktopNavbar from './DesktopNavbar';

// utils
import { isPage } from 'utils/helperUtils';

interface Props {
  setRef?: (arg: HTMLElement) => void | undefined;
  setMobileNavigationRef?: (arg: HTMLElement) => void | undefined;
}

class Navbar extends PureComponent<Props & WithRouterProps> {
  constructor(props) {
    super(props);
  }

  handleRef = (element: HTMLElement) => {
    this.props.setRef && this.props.setRef(element);
  };

  handleMobileNavigationRef = (element: HTMLElement) => {
    this.props.setMobileNavigationRef &&
      this.props.setMobileNavigationRef(element);
  };

  render() {
    const { location } = this.props;

    const isAdminPage = isPage('admin', location.pathname);
    const isInitiativeFormPage = isPage('initiative_form', location.pathname);
    const isIdeaFormPage = isPage('idea_form', location.pathname);
    const isIdeaEditPage = isPage('idea_edit', location.pathname);
    const isInitiativeEditPage = isPage('initiative_edit', location.pathname);

    const showMobileNav =
      !isAdminPage &&
      !isIdeaFormPage &&
      !isInitiativeFormPage &&
      !isIdeaEditPage &&
      !isInitiativeEditPage;

    return showMobileNav ? (
      <MobileNavbar setRef={this.handleMobileNavigationRef} />
    ) : (
      <DesktopNavbar />
    );
  }
}

export default withRouter(Navbar);
