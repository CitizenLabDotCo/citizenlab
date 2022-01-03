import React, { PureComponent } from 'react';
import {
  IConsentData,
  updateConsent,
  IConsent,
  updateConsentWithToken,
  getCategorizedConsents,
} from 'services/campaignConsents';

// components
import SubmitWrapper from 'components/admin/SubmitWrapper';
import T from 'components/T';
import Button from 'components/UI/Button';
import CheckboxWithPartialCheck from 'components/UI/CheckboxWithPartialCheck';
import Checkbox from 'components/UI/Checkbox';
import { ScreenReaderOnly } from 'utils/a11y';

// analytics
import { trackEventByName } from 'utils/analytics';
import { FormSectionTitle, FormSection } from 'components/UI/FormComponents';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { CSSTransition } from 'react-transition-group';

const timeout = 400;

const CategoryCheckboxContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledCheckboxWithPartialCheck = styled(CheckboxWithPartialCheck)``;

const ArrowIcon = styled(Icon)`
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  transform: rotate(90deg);
  transition: all 0.2s linear;
  margin-left: 5px;

  &.open {
    transform: rotate(0deg);
  }
`;

const AnimatedFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  opacity: 0;
  display: none;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
  will-change: opacity, height;

  &.collapse-enter {
    opacity: 0;
    max-height: 0px;
    overflow: hidden;
    display: block;

    &.collapse-enter-active {
      opacity: 1;
      max-height: 350px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-enter-done {
    opacity: 1;
    overflow: visible;
    display: block;
  }

  &.collapse-exit {
    opacity: 1;
    max-height: 350px;
    overflow: hidden;
    display: block;

    &.collapse-exit-active {
      opacity: 0;
      max-height: 0px;
      overflow: hidden;
      display: block;
    }
  }

  &.collapse-exit-done {
    display: none;
  }
`;

const CheckboxContainer = styled.div`
  margin-bottom: 12px;
  margin-left: 34px;

  &.first {
    margin-top: 15px;
  }
`;

const ConsentList = styled.div`
  padding-top: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${colors.separation};

  &.first {
    border-top: 1px solid ${colors.separation};
  }

  &.last {
    margin-bottom: 20px;
  }
`;

const StyledSubmitWrapper = styled(SubmitWrapper)``;

type Props = {
  consents: IConsentData[];
  trackEventName: string;
  token?: string;
  runOnSave?: () => void;
};

interface State {
  consentChanges: Record<string, any>;
  isSaving: boolean;
  saveButtonStatus: 'enabled' | 'disabled' | 'error' | 'success';
  categorizedConsents: { [category: string]: IConsentData[] };
  isCategoryOpen: { [category: string]: boolean }; // whether the list of campaigns in this category is open or collapsed.
}

export default class ConsentForm extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      categorizedConsents: {},
      isCategoryOpen: {},
      consentChanges: {},
      isSaving: false,
      saveButtonStatus: 'disabled',
    };
  }

  componentDidMount() {
    const categorizedConsents = getCategorizedConsents(this.props.consents);
    const isCategoryOpen = {} as { [category: string]: boolean };

    Object.keys(categorizedConsents).forEach(
      (category) =>
        (isCategoryOpen[category] =
          !categorizedConsents[category].every(
            (consent) => consent.attributes.consented
          ) &&
          !categorizedConsents[category].every(
            (consent) => !consent.attributes.consented
          ))
    );

    this.setState({ categorizedConsents, isCategoryOpen });
  }

  componentDidUpdate(prevProps: Props) {
    const { consents } = this.props;
    if (prevProps.consents !== consents) {
      this.setState({ categorizedConsents: getCategorizedConsents(consents) });
    }
  }

  handleOnChange = (consent: IConsentData) => () => {
    const becomesConsented = this.isConsented(consent.id);
    this.setState((prevState) => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: !becomesConsented,
      },
      saveButtonStatus: 'enabled',
    }));
  };

  consent = (consent: IConsentData) => {
    this.setState((prevState) => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: true,
      },
      saveButtonStatus: 'enabled',
    }));
  };

  unconsent = (consent: IConsentData) => {
    this.setState((prevState) => ({
      consentChanges: {
        ...prevState.consentChanges,
        [consent.id]: false,
      },
      saveButtonStatus: 'enabled',
    }));
  };

  handleOnChangeCategory = (category) => () => {
    const { categorizedConsents } = this.state;

    if (
      categorizedConsents[category].every((consent) =>
        this.isConsented(consent.id)
      )
    ) {
      categorizedConsents[category].forEach((consent) =>
        this.unconsent(consent)
      );
    } else {
      categorizedConsents[category].forEach((consent) => this.consent(consent));
      this.setState(({ isCategoryOpen }) => ({
        isCategoryOpen: { ...isCategoryOpen, [category]: false },
      }));
    }
  };

  handleToggleOpenCategory = (category) => (event) => {
    event.stopPropagation();
    this.setState(({ isCategoryOpen }) => ({
      isCategoryOpen: {
        ...isCategoryOpen,
        [category]: !isCategoryOpen[category],
      },
    }));
  };

  isConsented = (consentId) => {
    const { consents } = this.props;
    const consent = consents.find((consent) => consent.id === consentId);
    if (typeof this.state.consentChanges[consentId] === 'undefined') {
      return consent && consent.attributes.consented;
    } else {
      return this.state.consentChanges[consentId];
    }
  };

  isConsentedCategory = (category) => {
    const { categorizedConsents } = this.state;
    if (
      categorizedConsents[category].find((consent) =>
        this.isConsented(consent.id)
      )
    ) {
      return (
        categorizedConsents[category].every((consent) =>
          this.isConsented(consent.id)
        ) || 'mixed'
      );
    } else {
      return false;
    }
  };

  handleOnSubmit = () => {
    const { trackEventName, token, runOnSave } = this.props;
    const { consentChanges } = this.state;
    let consentUpdates: Promise<IConsent>[] = [];

    // analytics
    trackEventByName(trackEventName, { extra: { consentChanges } });

    this.setState({ isSaving: true, saveButtonStatus: 'disabled' });
    if (consentChanges) {
      consentUpdates = Object.keys(consentChanges).map((consentId) => {
        return token
          ? updateConsentWithToken(
              consentId,
              this.isConsented(consentId),
              token
            )
          : updateConsent(consentId, this.isConsented(consentId));
      });
    }

    Promise.all(consentUpdates)
      .then(() => {
        this.setState({
          consentChanges: {},
          isSaving: false,
          saveButtonStatus: 'success',
        });
        runOnSave && runOnSave();
      })
      .catch(() => {
        this.setState({ saveButtonStatus: 'error' });
      });
  };

  render() {
    const { isSaving, saveButtonStatus, categorizedConsents, isCategoryOpen } =
      this.state;

    return (
      <FormSection id="e2e-consent-form">
        <form action="">
          <FormSectionTitle
            message={messages.notificationsTitle}
            subtitleMessage={messages.notificationsSubTitle}
          />

          {Object.entries(categorizedConsents).map(
            ([category, consents], index) => (
              <ConsentList
                key={category}
                className={`${index === 0 ? 'first' : ''} ${
                  index === Object.entries(categorizedConsents).length - 1
                    ? 'last'
                    : ''
                }`}
              >
                <CategoryCheckboxContainer>
                  <StyledCheckboxWithPartialCheck
                    id={category}
                    checked={this.isConsentedCategory(category)}
                    onChange={this.handleOnChangeCategory(category)}
                    label={
                      <FormattedMessage {...messages[`${category}Category`]} />
                    }
                  />
                  {consents.length > 1 && (
                    <Button
                      onClick={this.handleToggleOpenCategory(category)}
                      buttonStyle="text"
                      type="button"
                      ariaExpanded={isCategoryOpen[category]}
                      padding="0px"
                    >
                      {isCategoryOpen[category] ? (
                        <FormattedMessage {...messages.collapse} />
                      ) : (
                        <FormattedMessage {...messages.expand} />
                      )}
                      <ArrowIcon
                        name="dropdown"
                        className={isCategoryOpen[category] ? 'open' : ''}
                        ariaHidden
                      />
                    </Button>
                  )}
                </CategoryCheckboxContainer>
                <CSSTransition
                  classNames="collapse"
                  in={isCategoryOpen[category]}
                  appear={isCategoryOpen[category]}
                  timeout={timeout}
                  mounOnEnter={false}
                  unmountOnExit={false}
                  enter={true}
                  exit={true}
                >
                  <AnimatedFieldset>
                    <ScreenReaderOnly>
                      <legend>
                        <FormattedMessage {...messages.ally_categoryLabel} />
                      </legend>
                    </ScreenReaderOnly>

                    {consents.length > 1 &&
                      consents.map((consent, index) => (
                        <CheckboxContainer
                          key={consent.id}
                          className={`${index === 0 ? 'first' : ''} ${
                            index === consents.length - 1 ? 'last' : ''
                          }`}
                        >
                          <Checkbox
                            size="20px"
                            checked={this.isConsented(consent.id)}
                            onChange={this.handleOnChange(consent)}
                            label={
                              <T
                                value={
                                  consent.attributes
                                    .campaign_type_description_multiloc
                                }
                              />
                            }
                          />
                        </CheckboxContainer>
                      ))}
                  </AnimatedFieldset>
                </CSSTransition>
              </ConsentList>
            )
          )}

          <StyledSubmitWrapper
            status={saveButtonStatus}
            buttonStyle="primary"
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
