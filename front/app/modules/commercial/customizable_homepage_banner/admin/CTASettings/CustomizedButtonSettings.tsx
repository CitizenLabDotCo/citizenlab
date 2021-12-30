import { isEmpty } from 'lodash-es';
import { Input, Label } from '@citizenlab/cl2-component-library';
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
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

// Inspired by:
// front/app/containers/Admin/projects/edit/general/utils/validate.ts
// front/app/containers/Admin/settings/customize/index.tsx

// Similar input is used here (see validate)
// front/app/containers/Admin/projects/edit/general/index.tsx
const checkTextErrors = (
  textMultiloc: Multiloc | undefined,
  formatMessage: Function,
  tenantLocales
) => {
  let textError = {} as Multiloc;

  if (!isNilOrError(tenantLocales)) {
    tenantLocales.forEach((locale) => {
      if (isEmpty(textMultiloc?.[locale])) {
        textError[locale] = formatMessage(genericMessages.blank);
      }
    });
  }

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
  const handleOnChange = (buttonKey: keyof CustomizedButtonConfig, value) => {
    handleSettingOnChange(customizedButtonKey, {
      ...buttonConfig,
      [buttonKey]: value,
    });
  };
  const tenantLocales = useAppConfigurationLocales();
  const [textError, setTextError] = useState({} as Multiloc);

  // storing textError in memo and then passing it to setTextError causes infinite rerendering
  useMemo(() => {
    if (errors[`customizable_homepage_banner.${customizedButtonKey}.text`]) {
      setTextError(
        checkTextErrors(buttonConfig?.text, formatMessage, tenantLocales)
      );
    }
  }, [errors, setTextError, buttonConfig, formatMessage, tenantLocales]);

  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={buttonConfig?.text}
        label={<FormattedMessage {...messages.customized_button_text_label} />}
        onChange={(titleMultiloc: Multiloc) => {
          handleOnChange('text', titleMultiloc);
          // We set it to {} because if it's set to the current error,
          // it jumps to the next empty locale input after typing the first letter in the first empty locale input.
          // The same done in front/app/containers/Admin/projects/edit/general/index.tsx#handleTitleMultilocOnChange
          setTextError({});
        }}
        // we need it null and not {} to make an error disappear after entering a valid value
        errorMultiloc={!isEmpty(textError) ? textError : null}
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
