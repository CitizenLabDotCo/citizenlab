import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import React from 'react';
import messages from './messages';
import { IconTooltip, Label, Radio } from 'cl2-component-library';
import {
  IAppConfigurationSettingsCustomizableHomepageBanner,
  CTASignedOutButton,
  CTASignedInButton,
} from 'services/appConfiguration';

interface SigninStateProps {
  options: string[];
  currentValue: string;
  signInState: 'not_signed_in' | 'signed_in';
}

const CallToActionSettingsSigninState = ({
  options,
  currentValue,
  signInState,
}: SigninStateProps) => (
  <SectionField>
    <Label>
      <FormattedMessage
        {...{
          signed_in: messages.signed_in,
          not_signed_in: messages.not_signed_in,
        }[signInState]}
      />
    </Label>
    {options.map((option) => (
      <Radio
        key={option}
        onChange={() => {}}
        currentValue={currentValue}
        value={option}
        label={<FormattedMessage {...messages[option]} />}
        name={`call_to_action_${signInState}_selected_option`}
        id={`locale-${currentValue}`}
      />
    ))}
  </SectionField>
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
      <CallToActionSettingsSigninState
        options={CALL_TO_ACTION_NOT_SIGNED_IN_OPTIONS}
        currentValue={call_to_action_not_signed_in_selected_option}
        signInState="not_signed_in"
      />
      <CallToActionSettingsSigninState
        options={CALL_TO_ACTION_SIGNED_IN_OPTIONS}
        currentValue={call_to_action_signed_in_selected_option}
        signInState="signed_in"
      />
    </Section>
  );
};

export default CallToActionButtonSettings;
