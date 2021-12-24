import { isEmpty } from 'lodash-es';
import { Input, Label } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import React from 'react';
import { CustomizedButtonConfig } from 'services/appConfiguration';
import { CLErrors, Multiloc } from 'typings';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import genericMessages from 'components/UI/Error/messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

// Inspired by:
// front/app/containers/Admin/projects/edit/general/utils/validate.ts
// front/app/containers/Admin/settings/customize/index.tsx

// Similar input is used here (see validate above)
// front/app/containers/Admin/projects/edit/general/index.tsx
// but
// - validation errors appear after submit
// - errors dissapear after changing input
// - when you type, cursor is not changing to the next locale
const checkTextErrors = (textMultiloc: Multiloc | undefined, formatMessage) => {
  const textError = {} as Multiloc;

  const tenantLocales = useAppConfigurationLocales();
  console.log('tenantLocales', tenantLocales);
  if (!isNilOrError(tenantLocales)) {
    tenantLocales.forEach((locale) => {
      if (isEmpty(textMultiloc?.[locale])) {
        textError[locale] = formatMessage(genericMessages.blank);
      }
    });
  }
  // forOwn(textMultiloc, (text, locale) => {
  //   if (isEmpty(text)) {
  //     textError[locale] = formatMessage(genericMessages.blank);
  //     console.log('CHECK', textError);
  //   }
  // });

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
  // const [textError, setTextError] = useState({} as Multiloc);
  let textError;
  if (errors[`customizable_homepage_banner.${customizedButtonKey}.text`]) {
    textError = checkTextErrors(buttonConfig?.text, formatMessage);
  }
  // useMemo(() => {
  //   console.log('buttonConfig', buttonConfig);
  // setTextError(checkTextErrors(buttonConfig?.text, formatMessage));
  // }, [setTextError, buttonConfig, formatMessage]);
  // setTextError(textErrors);
  console.log('buttonConfig?.text', buttonConfig?.text);
  console.log('textError', textError);
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={buttonConfig?.text}
        label={<FormattedMessage {...messages.customized_button_text_label} />}
        onChange={(titleMultiloc: Multiloc) => {
          handleOnChange('text', titleMultiloc);
          // setTextError(checkTextErrors(titleMultiloc, formatMessage));
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
