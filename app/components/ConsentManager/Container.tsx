import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// Events
import eventEmitter from 'utils/eventEmitter';

import Banner from './Banner';
import PreferencesDialog from './PreferencesDialog';
import CancelDialog from './CancelDialog';
import Modal from 'components/UI/Modal';

import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';

import { IDestination, CustomPreferences } from './';

interface Props {
  setPreferences: Function;
  resetPreferences: () => void;
  saveConsent: () => void;
  destinations: IDestination[];
  newDestinations: IDestination[];
  preferences: CustomPreferences;
  isConsentRequired: boolean;
  implyConsentOnInteraction: boolean;
}

interface State {
  isDialogOpen: boolean;
  isCancelling: boolean;
}

export default class Container extends PureComponent<Props, State> {
  subscriptions: Subscription[] = [];
  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false,
      isCancelling: false
    };
  }
  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent('openConsentManager').subscribe(this.openDialog)
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const {
      destinations,
      newDestinations,
      preferences,
      isConsentRequired,
    } = this.props;
    const { isDialogOpen, isCancelling } = this.state;
    const categoryDestinatons = {
      analytics: [] as IDestination[],
      advertising: [] as IDestination[],
      functional: [] as IDestination[],
    };

    for (const destination of destinations) {
      if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
        categoryDestinatons.advertising.push(destination);
      } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
        categoryDestinatons.functional.push(destination);
      } else {
        // Fallback to analytics
        categoryDestinatons.analytics.push(destination);
      }
    }
    // TODO: add state for banner so it doesn't disappear on implicit consent (which is annoying UX)
    return (
      <>
        <Modal
          opened={isDialogOpen}
          close={this.closeDialog}
        >
          {!isCancelling &&
            <PreferencesDialog
              onCancel={this.handleCancel}
              onSave={this.handleSave}
              onChange={this.handleCategoryChange}
              categoryDestinatons={categoryDestinatons}
              analytics={preferences.analytics}
              advertising={preferences.advertising}
              functional={preferences.functional}
            />
          }
          {isCancelling &&
            <CancelDialog
              onCancelConfirm={this.handleCancelConfirm}
              onCancelBack={this.handleCancelBack}
            />
          }
        </Modal>
        {isConsentRequired && newDestinations.length > 0 && (
          <Banner
            onAccept={this.handleBannerAccept}
            onChangePreferences={this.openDialog}
          />
        )}
      </>
    );
  }

  openDialog = () => {
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
    const { resetPreferences, newDestinations, preferences } = this.props;

    const isEmpty = Object.keys(preferences).every(e => preferences[e] === null);

    // Only show the cancel confirmation if there's unconsented destinations...
    // or if the user made a choice
    if (newDestinations.length > 0 && !isEmpty) {
      this.setState({
        isCancelling: true
      });
    } else {
      this.setState({
        isDialogOpen: false
      });
      resetPreferences();
    }
  }

  handleCancelBack = () => {
    this.setState({
      isCancelling: false
    });
  }

  handleCancelConfirm = () => {
    const { resetPreferences } = this.props;

    this.setState({
      isCancelling: false,
      isDialogOpen: false
    });
    resetPreferences();
  }
}
