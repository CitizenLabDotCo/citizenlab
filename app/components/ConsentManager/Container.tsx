import React, { PureComponent } from 'react';

import Banner from './Banner';
import Preferences from './Preferences';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';

import { IDestination } from 'utils/analytics';

interface Props {
  setPreferences: Function;
  resetPreferences: Function;
  saveConsent: Function;
  destinations: IDestination[];
  newDestinations: IDestination[];
  preferences: any;
  isConsentRequired: boolean;
  implyConsentOnInteraction: boolean;
}

interface State {
  isDialogOpen: boolean;
  isCancelling: boolean;
}

export default class Container extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false,
      isCancelling: false
    };
  }

  render() {
    console.log(this.state);
    const {
      destinations,
      newDestinations,
      preferences,
      isConsentRequired,
    } = this.props;
    const { isDialogOpen, isCancelling } = this.state;
    const marketingDestinations = [] as IDestination[];
    const advertisingDestinations = [] as IDestination[];
    const functionalDestinations = [] as IDestination[];

    for (const destination of destinations) {
      if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
        advertisingDestinations.push(destination);
      } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
        functionalDestinations.push(destination);
      } else {
        // Fallback to marketing
        marketingDestinations.push(destination);
      }
    }

    // TODO: add state for banner so it doesn't disappear on implicit consent (which is annoying UX)
    return (
      <>
        {isConsentRequired &&
          newDestinations.length > 0 && (
            <Banner
              onAccept={this.handleBannerAccept}
              onChangePreferences={this.openDialog}
            />
          )}
        <Modal
          opened={isDialogOpen || isCancelling}
          close={this.closeDialog}
          header={<h2>Your privacy preferences</h2>}
          footer={this.renderPrefFooter(preferences.marketingAndAnalytics, preferences.advertising, preferences.functional, isDialogOpen, isCancelling)}
        >
          {isDialogOpen &&
            <Preferences
              onCancel={this.handleCancel}
              onSave={this.handleSave}
              onChange={this.handleCategoryChange}
              marketingDestinations={marketingDestinations}
              advertisingDestinations={advertisingDestinations}
              functionalDestinations={functionalDestinations}
              marketingAndAnalytics={preferences.marketingAndAnalytics}
              advertising={preferences.advertising}
              functional={preferences.functional}
            />
          }
          {isCancelling &&
            <div>
              If you cancel, your preferences won't be saved
            </div>
          }
        </Modal>
      </>
    );
  }
  renderPrefFooter = (marketingAndAnalytics, advertising, functional, isDialogOpen, isCancelling) => {
    if (isDialogOpen) {
      return (
        <div>
          <Button onClick={this.handleCancel}>
            Cancel
      </Button>
          <Button onClick={this.handleSubmit(marketingAndAnalytics, advertising, functional)}>Save</Button>
        </div>
      );
    } else if (isCancelling) {
      return (
        <div>
          <Button onClick={this.handleCancelBack}>
            Go back
      </Button>
          <Button onClick={this.handleCancelConfirm}>Cancel anyway</Button>
        </div>
      );
    }
    return;
  }
  handleSubmit = (marketingAndAnalytics, advertising, functional) => e => {

    e.preventDefault();

    // Safe guard against browsers that don't prevent the
    // submission of invalid forms (Safari < 10.1)
    if (
      marketingAndAnalytics === null ||
      advertising === null ||
      functional === null
    ) {
      return;
    }

    this.handleSave();
  }

  openDialog = () => {
    console.log('open sesame');
    this.setState({
      isDialogOpen: true
    });
  }

  closeDialog = () => {
    this.setState({
      isDialogOpen: false
    });
  }

  handleBannerAccept = () => {
    const { saveConsent } = this.props;

    saveConsent();
  }

  handleCategoryChange = (category, value) => {
    const { setPreferences } = this.props;

    setPreferences({
      [category]: value
    });
  }

  handleSave = () => {
    const { saveConsent } = this.props;

    this.setState({
      isDialogOpen: false
    });
    saveConsent();
  }

  handleCancel = () => {
    const { resetPreferences, newDestinations } = this.props;

    this.setState({
      isDialogOpen: false
    });

    // Only show the cancel confirmation if there's unconsented destinations
    if (newDestinations.length > 0) {
      this.setState({
        isCancelling: true
      });
    } else {
      resetPreferences();
    }
  }

  handleCancelBack = () => {
    this.setState({
      isDialogOpen: true,
      isCancelling: false
    });
  }

  handleCancelConfirm = () => {
    const { resetPreferences } = this.props;

    this.setState({
      isCancelling: false
    });
    resetPreferences();
  }
}
