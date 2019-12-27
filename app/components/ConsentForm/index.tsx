import React, { PureComponent } from 'react';
import messages from './messages';
import { IConsentData, updateConsent, IConsent, updateConsentWithToken, getCategorizedConsents } from 'services/campaignConsents';
import styled from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { find } from 'lodash-es';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

// analytics
import { trackEventByName } from 'utils/analytics';
import { FormSectionTitle, FormSection } from 'components/UI/FormComponents';

const CheckboxContainer = styled.div`
  margin-bottom: 16px;
`;

const ConsentList = styled.div`
  margin-bottom: 40px;
`;

type Props = {
  consents: IConsentData[];
  trackEventName: string;
  token?: string;
};

interface State {
  consentChanges: {};
  isSaving: boolean;
  saveButtonStatus: 'enabled' | 'disabled' | 'error' | 'success';
  categorizedConsents: { [category: string]: IConsentData[] };
}

export default class ConsentForm extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props as any);
    this.state = {
      consentChanges: {},
      isSaving: false,
      saveButtonStatus: 'disabled',
      categorizedConsents: getCategorizedConsents(props.consents)
    };
  }

  calculateCategoryChecks = () => {

  }

  componentDidUpdate(prevProps: Props) {
    const { consents } = this.props;
    if (prevProps.consents !== consents) {
      this.setState({ categorizedConsents: getCategorizedConsents(consents) });
    }
  }

  handleOnChange = (consent: IConsentData) => () => {
    const becomesConsented = this.isConsented(consent.id);
    this.setState(prevState => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: !becomesConsented,
      },
      saveButtonStatus: 'enabled'
    }));
  }

  consent = (consent: IConsentData) => {
    this.setState(prevState => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: true,
      },
      saveButtonStatus: 'enabled'
    }));
  }

  unconsent = (consent: IConsentData) => {
    this.setState(prevState => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: false,
      },
      saveButtonStatus: 'enabled'
    }));
  }

  handleOnChangeCategory = (category) => () => {
    const { categorizedConsents } = this.state;

    if (this.isConsentedCategory(category)) {
      categorizedConsents[category].forEach(consent => this.unconsent(consent));
    } else {
      categorizedConsents[category].forEach(consent => this.consent(consent));
    }
  }

  isConsented = (consentId) => {
    const { consents } = this.props;
    const consent = find(consents, { id: consentId }) as IConsentData;
    if (typeof (this.state.consentChanges[consentId]) === 'undefined') {
      return (consent && consent.attributes.consented);
    } else {
      return this.state.consentChanges[consentId];
    }
    return false;
  }

  isConsentedCategory = (category) => {
    const { categorizedConsents } = this.state;
    return categorizedConsents[category].every(consent => this.isConsented(consent.id));
  }

  handleOnSubmit = () => {
    const { trackEventName, token } = this.props;
    const { consentChanges } = this.state;
    let consentUpdates: Promise<IConsent>[] = [];

    // analytics
    trackEventByName(trackEventName, { extra: { consentChanges } });

    this.setState({ isSaving: true, saveButtonStatus: 'disabled' });
    if (consentChanges) {
      consentUpdates = Object.keys(consentChanges).map(consentId => {
        return token ? updateConsentWithToken(consentId, this.isConsented(consentId), token) : updateConsent(consentId, this.isConsented(consentId));
      });
    }

    Promise.all(consentUpdates).then(() => {
      this.setState({
        consentChanges: {},
        isSaving: false,
        saveButtonStatus: 'success'
      });
    }).catch(() => {
      this.setState({ saveButtonStatus: 'error' });
    });
  }

  render() {
    const { isSaving, saveButtonStatus, categorizedConsents } = this.state;

    return (
      <FormSection>
        <form action="">
          <FormSectionTitle message={messages.notificationsTitle} subtitleMessage={messages.notificationsSubTitle} />
          <ConsentList>
            {Object.entries(categorizedConsents).map(([category, consents]) => (
              <>
                <CheckboxContainer key={category}>
                  <Checkbox
                    id={category}
                    checked={this.isConsentedCategory(category)}
                    onChange={this.handleOnChangeCategory(category)}
                    label={category}
                  />
                </CheckboxContainer>
                {consents.map(consent => (
                  <CheckboxContainer key={consent.id}>
                    <Checkbox
                      id={consent.id}
                      checked={this.isConsented(consent.id)}
                      onChange={this.handleOnChange(consent)}
                      label={<T value={consent.attributes.campaign_type_description_multiloc} />}
                    />
                  </CheckboxContainer>
                ))}
              </>
            ))}
          </ConsentList>
          <SubmitWrapper
            status={saveButtonStatus}
            style="primary"
            loading={isSaving}
            onClick={this.handleOnSubmit}
            messages={{
              buttonSave: messages.submit,
              buttonSuccess: messages.buttonSuccessLabel,
              messageSuccess: messages.messageSuccess,
              messageError: messages.messageError,
            }}
          />
        </form>
      </FormSection>
    );
  }
}
