import React, { PureComponent, FormEvent } from 'react';
import { Subscription } from 'rxjs';

// Events
import eventEmitter from 'utils/eventEmitter';

// Components
import Banner from './Banner';
import PreferencesDialog, { ContentContainer } from './PreferencesDialog';
import LoadableModal from 'components/Loadable/Modal';
import Footer from './Footer';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

import { ADVERTISING_CATEGORIES, FUNCTIONAL_CATEGORIES } from './categories';

import { IDestination, CustomPreferences } from './';

import styled from 'styled-components';

export const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

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
  categoryDestinations: {
    analytics: IDestination[],
    advertising: IDestination[],
    functional: IDestination[],
  };
}

export class Container extends PureComponent<Props & InjectedIntlProps, State> {
  subscriptions: Subscription[] = [];

  constructor(props) {
    super(props);
    this.state = {
      isDialogOpen: false,
      isCancelling: false,
      categoryDestinations: {
        analytics: [] as IDestination[],
        advertising: [] as IDestination[],
        functional: [] as IDestination[],
      }
    };
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter.observeEvent('openConsentManager').subscribe(this.openDialog)
    ];
    this.assignDestinations();
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.destinations !== prevProps.destinations) {
      this.assignDestinations();
    }
  }

  assignDestinations = () => {
    const { categoryDestinations } = this.state;
    for (const destination of this.props.destinations) {
      if (ADVERTISING_CATEGORIES.find(c => c === destination.category)) {
        categoryDestinations.advertising.push(destination);
      } else if (FUNCTIONAL_CATEGORIES.find(c => c === destination.category)) {
        categoryDestinations.functional.push(destination);
      } else {
        // Fallback to analytics
        categoryDestinations.analytics.push(destination);
      }
    }
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

  handleCategoryChange = (category: string, value: boolean) => {
    const { setPreferences } = this.props;

    setPreferences({
      [category]: value
    });
  }

  validate = () => {
    let res = true;
    const { categoryDestinations } = this.state;
    const { preferences } = this.props;
    for (const category of Object.keys(categoryDestinations)) {
      if (categoryDestinations[category].length > 0) {
        res = res && !(preferences[category] === null);
      }
    }
    return res;
  }

  handleSave = (e: FormEvent<any>) => {
    e.preventDefault();

    if (!this.validate()) {
      return;
    }

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
      this.setState({ isCancelling: true });
    } else {
      this.setState({ isDialogOpen: false });
      resetPreferences();
    }
  }

  handleCancelBack = () => {
    this.setState({ isCancelling: false });
  }

  handleCancelConfirm = () => {
    const { resetPreferences } = this.props;

    this.setState({
      isCancelling: false,
      isDialogOpen: false
    });
    resetPreferences();
  }

  render() {
    const {
      newDestinations,
      preferences,
      isConsentRequired,
      intl,
    } = this.props;
    const { isDialogOpen, isCancelling, categoryDestinations } = this.state;

    return (
      <>
        <LoadableModal
          opened={isDialogOpen}
          close={this.closeDialog}
          label={intl.formatMessage(messages.modalLabel)}
          header={<FormattedMessage {...messages.title} />}
          footer={<Footer
            validate={this.validate}
            isCancelling={this.state.isCancelling}
            handleCancelBack={this.handleCancelBack}
            handleCancelConfirm={this.handleCancelConfirm}
            handleCancel={this.handleCancel}
            handleSave={this.handleSave}
          />}
        >
          {!isCancelling &&
            <PreferencesDialog
              onChange={this.handleCategoryChange}
              categoryDestinations={categoryDestinations}
              analytics={preferences.analytics}
              advertising={preferences.advertising}
              functional={preferences.functional}
            />
          }
          {isCancelling &&
            <ContentContainer role="dialog" aria-modal>
              <FormattedMessage {...messages.confirmation} tagName="h1" />
            </ContentContainer>
          }
        </LoadableModal>
        {isConsentRequired && newDestinations.length > 0 && (
          <Banner
            onAccept={this.handleBannerAccept}
            onChangePreferences={this.openDialog}
          />
        )}
      </>
    );
  }
}

export default injectIntl(Container);
