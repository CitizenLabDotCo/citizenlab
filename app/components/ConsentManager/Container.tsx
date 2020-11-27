import React, { PureComponent, FormEvent } from 'react';
import { Subscription } from 'rxjs';

// Events
import eventEmitter from 'utils/eventEmitter';

// Components
import Banner from './Banner';
import PreferencesDialog, { ContentContainer } from './PreferencesDialog';
import Footer from './Footer';
import LoadableModal from 'components/Loadable/Modal';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { CategorizedDestinations, IPreferences } from './';

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
  accept: () => void;
  saveConsent: () => void;
  isConsentRequired: boolean;
  preferences: IPreferences;
  categorizedDestinations: CategorizedDestinations;
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
      isCancelling: false,
    };
  }

  componentDidMount() {
    this.subscriptions = [
      eventEmitter
        .observeEvent('openConsentManager')
        .subscribe(this.openDialog),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  openDialog = () => {
    this.setState({
      isDialogOpen: true,
    });
  };

  closeDialog = () => {
    this.setState({
      isDialogOpen: false,
    });
  };

  handleCategoryChange = (category: string, value: boolean) => {
    const { setPreferences } = this.props;

    setPreferences({
      [category]: value,
    });
  };

  validate = () => {
    let res = true;
    const { preferences, categorizedDestinations } = this.props;
    for (const category of Object.keys(categorizedDestinations)) {
      if (categorizedDestinations[category].length > 0) {
        res = res && !(preferences[category] === undefined);
      }
    }
    return res;
  };

  handleSave = (e: FormEvent<any>) => {
    e.preventDefault();

    if (!this.validate()) {
      return;
    }

    const { saveConsent } = this.props;

    this.setState({
      isDialogOpen: false,
    });
    saveConsent();
  };

  handleCancel = () => {
    const { resetPreferences, isConsentRequired, preferences } = this.props;

    const isEmpty = Object.values(preferences).every((e) => e === undefined);

    // Only show the cancel confirmation if there's unconsented destinations...
    // or if the user made a choice and we want to confirm aborting it
    if (isConsentRequired && !isEmpty) {
      this.setState({ isCancelling: true });
    } else {
      this.setState({ isDialogOpen: false });
      resetPreferences();
    }
  };

  handleCancelBack = () => {
    this.setState({ isCancelling: false });
  };

  handleCancelConfirm = () => {
    const { resetPreferences } = this.props;

    this.setState({
      isCancelling: false,
      isDialogOpen: false,
    });
    resetPreferences();
  };

  render() {
    const {
      preferences,
      isConsentRequired,
      categorizedDestinations,
      accept,
    } = this.props;
    const { isDialogOpen, isCancelling } = this.state;
    const noDestinations = Object.values(categorizedDestinations).every(
      (array) => array.length === 0
    );
    const mode = noDestinations
      ? 'noDestinations'
      : !isCancelling
      ? 'preferenceForm'
      : 'cancelling';

    return (
      <>
        <LoadableModal
          opened={isDialogOpen}
          close={this.closeDialog}
          header={<FormattedMessage {...messages.title} />}
          footer={
            <Footer
              validate={this.validate}
              mode={mode}
              handleCancelBack={this.handleCancelBack}
              handleCancelConfirm={this.handleCancelConfirm}
              handleCancel={this.handleCancel}
              handleSave={this.handleSave}
            />
          }
        >
          {!isCancelling ? (
            <PreferencesDialog
              onChange={this.handleCategoryChange}
              categoryDestinations={categorizedDestinations}
              preferences={preferences}
            />
          ) : (
            <ContentContainer role="dialog" aria-modal>
              <FormattedMessage {...messages.confirmation} tagName="h1" />
            </ContentContainer>
          )}
        </LoadableModal>

        {isConsentRequired && (
          <Banner onAccept={accept} onChangePreferences={this.openDialog} />
        )}
      </>
    );
  }
}
