import React, { PureComponent } from 'react';
import { IConsentData, updateConsent, IConsent, updateConsentWithToken, getCategorizedConsents } from 'services/campaignConsents';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import T from 'components/T';
import Button from 'components/UI/Button';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import Checkbox from 'components/UI/Checkbox';
import { Fieldset, ScreenReaderOnly } from 'utils/a11y';

// analytics
import { trackEventByName } from 'utils/analytics';
import { FormSectionTitle, FormSection } from 'components/UI/FormComponents';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Icon from 'components/UI/Icon';
import { CSSTransition } from 'react-transition-group';

const CategoryCheckboxContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 20px;
  }

  label {
    color: ${({ theme }) => theme.colorMain};
    font-weight: 700;
  }
  display: flex;
  justify-content: space-between;
`;

const StyledCheckboxWithPartialCheck = styled(CheckboxWithPartialCheck)`
  padding: 10px 0px;
`;

const ArrowIcon = styled(Icon)`
  flex: 0 0 13px;
  width: 13px;
  height: 13px;
  transform: rotate(90deg);
  transition: all .2s linear;
  margin-left: 5px;

  &.open {
    transform: rotate(0deg);
  }
`;

const AnimatedFieldset = styled(Fieldset)`
  &.dropdown-enter {
    opacity: 0;
    transform: translateY(-8px);

    &.dropdown-enter-active {
      opacity: 1;
      transform: translateY(0px);
      transition: all 300ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
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
  runOnSave?: () => void;
};

interface State {
  consentChanges: {};
  isSaving: boolean;
  saveButtonStatus: 'enabled' | 'disabled' | 'error' | 'success';
  categorizedConsents: { [category: string]: IConsentData[] };
  isCategoryOpen: { [category: string]: boolean }; // whether the list of campaigns in this category is open or collapsed.
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
    const { trackEventName, token, runOnSave } = this.props;
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
      runOnSave && runOnSave();
    }).catch(() => {
      this.setState({ saveButtonStatus: 'error' });
    });
  }

  render() {
    const { isSaving, saveButtonStatus, categorizedConsents, isCategoryOpen } = this.state;

    return (
      <FormSection id="e2e-consent-form">
        <form action="">
          <FormSectionTitle message={messages.notificationsTitle} subtitleMessage={messages.notificationsSubTitle} />
          {Object.entries(categorizedConsents).map(([category, consents]) => (
            <ConsentList key={category}>
              <CategoryCheckboxContainer>
                <StyledCheckboxWithPartialCheck
                  id={category}
                  checked={this.isConsentedCategory(category)}
                  onChange={this.handleOnChangeCategory(category)}
                  label={<FormattedMessage {...messages[`${category}Category`]} />}
                />
                {consents.length > 1 &&
                  <Button onClick={this.handleToggleOpenCategory(category)} style="text" type="button" ariaExpanded={isCategoryOpen[category]} padding="10px 0px 10px 5px">
                    {isCategoryOpen[category]
                      ? <FormattedMessage {...messages.collapse} />
                      : <FormattedMessage {...messages.expand} />
                    }
                    <ArrowIcon name="dropdown" className={isCategoryOpen[category] ? 'open' : ''} ariaHidden />
                  </Button>
                }
              </CategoryCheckboxContainer>
              <CSSTransition
                in={isCategoryOpen[category]}
                timeout={30}
                mountOnEnter={true}
                unmountOnExit={true}
                exit={false}
                classNames="dropdown"
              >
                <AnimatedFieldset>
                  <ScreenReaderOnly>
                    <legend>
                      <FormattedMessage {...messages.ally_categoryLabel} />
                    </legend>
                  </ScreenReaderOnly>

                  {consents.length > 1 && consents.map(consent => (
                    <CheckboxContainer key={consent.id}>
                      <Checkbox
                        id={consent.attributes.campaign_name}
                        checked={this.isConsented(consent.id)}
                        onChange={this.handleOnChange(consent)}
                        label={<T value={consent.attributes.campaign_type_description_multiloc} />}
                      />
                    </CheckboxContainer>
                  ))}
                </AnimatedFieldset>
              </CSSTransition>
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
