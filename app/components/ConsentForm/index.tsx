import React, { PureComponent } from 'react';
import { IConsentData, updateConsent, IConsent, updateConsentWithToken, getCategorizedConsents } from 'services/campaignConsents';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import T from 'components/T';
import Checkbox from 'components/UI/Checkbox';

// analytics
import { trackEventByName } from 'utils/analytics';
import { FormSectionTitle, FormSection } from 'components/UI/FormComponents';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import Button from 'components/UI/Button';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';

const CategoryCheckboxContainer = styled.div`
  margin-bottom: 16px;
  label {
    font-size: ${fontSizes.large}px;
  }
  display: flex;
  justify-content: space-between;
`;

const CheckboxContainer = styled.div`
  margin-bottom: 16px;
  margin-left: 15px;
`;

const ConsentList = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid ${colors.separation};
`;

const StyledSubmitWrapper = styled(SubmitWrapper)`
  margin-top: 20px;
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
  isCategoryOpen: { [category: string]: boolean };
}

export default class ConsentForm extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props as any);

    const categorizedConsents = getCategorizedConsents(props.consents);

    const isCategoryOpen = {} as { [category: string]: boolean };
    Object.keys(categorizedConsents).forEach(category =>
      isCategoryOpen[category] = !categorizedConsents[category].every(consent => consent.attributes.consented)
        && !categorizedConsents[category].every(consent => !consent.attributes.consented)
    );

    this.state = {
      categorizedConsents,
      isCategoryOpen,
      consentChanges: {},
      isSaving: false,
      saveButtonStatus: 'disabled',
    };
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

    if (categorizedConsents[category].every(consent => this.isConsented(consent.id))) {
      categorizedConsents[category].forEach(consent => this.unconsent(consent));
    } else {
      categorizedConsents[category].forEach(consent => this.consent(consent));
      this.setState(({ isCategoryOpen }) => ({ isCategoryOpen: { ...isCategoryOpen, [category]: false } }));
    }
  }

  handleToggleOpenCategory = (category) => (event) => {
    event.stopPropagation();
    this.setState(({ isCategoryOpen }) => ({ isCategoryOpen: { ...isCategoryOpen, [category]: !isCategoryOpen[category] } }));
  }

  isConsented = (consentId) => {
    const { consents } = this.props;
    const consent = consents.find(consent => consent.id === consentId);
    if (typeof (this.state.consentChanges[consentId]) === 'undefined') {
      return (consent && consent.attributes.consented);
    } else {
      return this.state.consentChanges[consentId];
    }
  }

  isConsentedCategory = (category) => {
    const { categorizedConsents } = this.state;
    if (categorizedConsents[category].find(consent => this.isConsented(consent.id))) {
      return categorizedConsents[category].every(consent => this.isConsented(consent.id)) || 'mixed';
    } else {
      return false;
    }
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
    const { isSaving, saveButtonStatus, categorizedConsents, isCategoryOpen } = this.state;

    return (
      <FormSection>
        <form action="">
          <FormSectionTitle message={messages.notificationsTitle} subtitleMessage={messages.notificationsSubTitle} />
          {Object.entries(categorizedConsents).map(([category, consents]) => (
            <ConsentList key={category}>
              <CategoryCheckboxContainer>
                <CheckboxWithPartialCheck
                  id={category}
                  checked={this.isConsentedCategory(category)}
                  onChange={this.handleOnChangeCategory(category)}
                  label={<FormattedMessage {...messages[`${category}Category`]} />}
                />
                <Button onClick={this.handleToggleOpenCategory(category)} style="text">
                  {isCategoryOpen[category]
                    ? <FormattedMessage {...messages.hideDetails} />
                    : <FormattedMessage {...messages.seeDetails} />
                  }
                </Button>
              </CategoryCheckboxContainer>
              {isCategoryOpen[category] &&
                consents.map(consent => (
                  <CheckboxContainer key={consent.id}>
                    <Checkbox
                      id={consent.id}
                      checked={this.isConsented(consent.id)}
                      onChange={this.handleOnChange(consent)}
                      label={<T value={consent.attributes.campaign_type_description_multiloc} />}
                    />
                  </CheckboxContainer>
                ))
              }
            </ConsentList>
          ))}
          <StyledSubmitWrapper
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
