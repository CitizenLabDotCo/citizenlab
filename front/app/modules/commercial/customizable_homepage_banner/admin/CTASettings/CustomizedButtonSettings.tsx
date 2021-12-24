import { forOwn, isEmpty } from 'lodash-es';
import { Input, Label } from 'cl2-component-library';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import React, { useMemo, useState } from 'react';
import { CustomizedButtonConfig } from 'services/appConfiguration';
import { CLErrors, Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import genericMessages from 'components/UI/Error/messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Inspired by:
// front/app/containers/Admin/projects/edit/general/utils/validate.ts
// front/app/containers/Admin/settings/customize/index.tsx
const checkTextErrors = (textMultiloc: Multiloc | undefined, formatMessage) => {
  const textError = {} as Multiloc;

  forOwn(textMultiloc, (text, locale) => {
    if (isEmpty(text)) {
      textError[locale] = formatMessage(genericMessages.blank);
      console.log('CHECK', textError);
    }
  });

  return textError;
};

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
  intl,
}: Props & InjectedIntlProps) => {
  const customizedButtonKey = `cta_${signInStatus}_customized_button`;
  const { formatMessage } = intl;
  const handleOnChange = (buttonKey, value) => {
    handleSettingOnChange(customizedButtonKey, {
      ...buttonConfig,
      [buttonKey]: value,
    });
  };
  const [textError, setTextError] = useState({} as Multiloc);
  errors[`customizable_homepage_banner.${customizedButtonKey}.text`];
  const textErrors = useMemo(
    () => checkTextErrors(buttonConfig?.text, formatMessage),
    []
  );
  console.log('textErrors', textErrors);
  // setTextError(textErrors);
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={buttonConfig?.text}
        label={<FormattedMessage {...messages.customized_button_text_label} />}
        onChange={(titleMultiloc: Multiloc) => {
          handleOnChange('text', titleMultiloc);
          setTextError(checkTextErrors(titleMultiloc, formatMessage));
        }}
        errorMultiloc={textError}
      />
      <Label>
        <FormattedMessage {...messages.customized_button_url_label} />
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

export default injectIntl(CustomizedButtonSettings);
