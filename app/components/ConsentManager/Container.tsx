import React, { PureComponent } from 'react';

import Banner from './Banner';
import Preferences from './Preferences';
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
  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false,
      isCancelling: false
    };
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
          opened={isDialogOpen || isCancelling}
          close={this.closeDialog}
          header={<h2>Your privacy preferences</h2>}
        >
          {isDialogOpen &&
            <Preferences
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
            <div>
              If you cancel, your preferences won't be saved
            </div>
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
