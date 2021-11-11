import { Input, Label } from 'cl2-component-library';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import React from 'react';
import { CustomizedButtonConfig } from 'services/appConfiguration';
import { CLErrors, Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

interface Props {
  buttonConfig?: CustomizedButtonConfig;
  handleSettingOnChange: (settingKey: string, settingValue: any) => void;
  signInStatus: 'signed_out' | 'signed_in';
  errors: CLErrors;
}

const CustomizedButtonSettings = ({
  buttonConfig,
  handleSettingOnChange,
  signInStatus,
  errors,
}: Props) => {
  const customizedButtonKey = `cta_${signInStatus}_customized_button`;
  const handleOnChange = (buttonKey, value) => {
    handleSettingOnChange(customizedButtonKey, {
      ...buttonConfig,
      [buttonKey]: value,
    });
  };
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={buttonConfig?.text}
        label={<FormattedMessage {...messages.customized_button_text_label} />}
        onChange={(titleMultiloc: Multiloc) =>
          handleOnChange('text', titleMultiloc)
        }
        error={errors[
          `customizable_homepage_banner.${customizedButtonKey}.text`
        ]
          ?.map((err) => err.error)
          .join('. ')}
      />
      <Label>
        <FormattedMessage {...messages.customized_button_text_label} />
      </Label>
      <Input
        type="text"
        placeholder="https://..."
        onChange={(url: string) => handleOnChange('url', url)}
        value={buttonConfig?.url}
        error={errors[`customizable_homepage_banner.${customizedButtonKey}.url`]
          ?.map((err) => err.error)
          .join('. ')}
      />
    </SectionField>
  );
};

export default CustomizedButtonSettings;
