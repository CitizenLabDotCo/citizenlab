import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import React from 'react';
import messages from './messages';
import { IconTooltip, Label, Radio } from 'cl2-component-library';
import {
  IAppConfigurationSettingsCustomizableHomepageBanner,
  CTASignedOutButton,
  CTASignedInButton,
} from 'services/appConfiguration';

interface SigninStateProps {
  options: (CTASignedOutButton | CTASignedInButton)[];
  currentValue: string;
  signInState: 'not_signed_in' | 'signed_in';
  labelMessage: MessageDescriptor;
}

const CallToActionSettingsSigninState = ({
  options,
  currentValue,
  signInState,
  labelMessage,
}: SigninStateProps) => (
  <SectionField>
    <Label>
      <FormattedMessage {...labelMessage} />
    </Label>
    {options.map((option) => (
      <Radio
        key={option}
        onChange={() => {}}
        currentValue={currentValue}
        value={option}
        label={
          <FormattedMessage
            {...{
              sign_up_button: messages.sign_up_button,
              customized_button: messages.customized_button,
              no_button: messages.no_button,
            }[option]}
          />
        }
        name={`call_to_action_${signInState}_selected_option`}
        id={`${signInState}-${currentValue}`}
      />
    ))}
  </SectionField>
);

const CTASettingsSignedIn = ({ currentValue }) => (
  <CallToActionSettingsSigninState
    options={CALL_TO_ACTION_SIGNED_IN_OPTIONS}
    currentValue={currentValue}
    signInState="signed_in"
    labelMessage={messages.signed_in}
  />
);

const CTASettingsSignedOut = ({ currentValue }) => (
  <CallToActionSettingsSigninState
    options={CALL_TO_ACTION_NOT_SIGNED_IN_OPTIONS}
    currentValue={currentValue}
    signInState="not_signed_in"
    labelMessage={messages.not_signed_in}
  />
);

interface Props {
  customizable_homepage_banner: IAppConfigurationSettingsCustomizableHomepageBanner;
}

const CALL_TO_ACTION_NOT_SIGNED_IN_OPTIONS: CTASignedOutButton[] = [
  'sign_up_button',
  'customized_button',
  'no_button',
];
const CALL_TO_ACTION_SIGNED_IN_OPTIONS: CTASignedInButton[] = [
  'customized_button',
  'no_button',
];

const CallToActionButtonSettings = ({
  customizable_homepage_banner,
}: Props) => {
  const {
    call_to_action_not_signed_in_selected_option,
    // call_to_action_not_signed_in_customized_button,
    call_to_action_signed_in_selected_option,
    // call_to_action_signed_in_customized_button,
  } = customizable_homepage_banner;
  return (
    <Section key={'call-to-action-button'}>
      <SubSectionTitle>
        <FormattedMessage {...messages.callToActionHeader} />
        {/* <IconTooltip
          content={<FormattedMessage {...messages.callToActionHeader} />}
        /> */}
      </SubSectionTitle>
      <CTASettingsSignedOut
        currentValue={call_to_action_not_signed_in_selected_option}
      />
      <CTASettingsSignedIn
        currentValue={call_to_action_signed_in_selected_option}
      />
    </Section>
  );
};

export default CallToActionButtonSettings;
