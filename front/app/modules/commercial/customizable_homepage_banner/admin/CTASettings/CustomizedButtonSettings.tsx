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
import settingsMessages from 'containers/Admin/settings/messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

// Validations for these inputs are duplicated on BE and FE.
// We need them on BE (AppConfiguration model):
// 1. To be sure that the values in DB are valid (for rake tasks and other things).
// 2. To pass more or less easily the state of submit and errors from the top form component to this component.
//    Another option would be to move validations up in the component tree, but it seems they belong here.
//
// We need them on FE:
// 1. It's more user friendly.
// 2. We use FE validations more often and so we have some translations for them on FE and not on BE (e.g. blank, wrong URL format)
// 3. Rails model errors are simple key-value pairs, but e.g. for InputMultiloc we need messages for inputs
//    in each language. It can be implemented, but it would be custom and complicated.

// FE validations are inspired by:
// front/app/containers/Admin/projects/edit/general/utils/validate.ts
// front/app/containers/Admin/settings/customize/index.tsx

// Similar input is used here (see validate)
// front/app/containers/Admin/projects/edit/general/index.tsx
const getTextErrors = (
  textMultiloc: Multiloc | undefined,
  errors: CLErrors,
  formatMessage: Function,
  tenantLocales
) => {
  let textError = {} as Multiloc;

  // Prevent displaying errors on the first render.
  if (isEmpty(errors)) {
    return textError;
  }

  if (!isNilOrError(tenantLocales)) {
    tenantLocales.forEach((locale) => {
      if (isEmpty(textMultiloc?.[locale])) {
        textError[locale] = formatMessage(genericMessages.blank);
      }
    });
  }

  return textError;
};

const getUrlErrors = (
  url: string | undefined,
  errors: CLErrors,
  formatMessage: Function
) => {
  // Prevent displaying errors on the first render.
  if (isEmpty(errors)) {
    return;
  }
  if (isEmpty(url)) {
    return formatMessage(genericMessages.blank);
  }
  // RegExp is copied from back/config/schemas/settings.schema.json.erb
  if (!url?.match(new RegExp('^$|^((http://.+)|(https://.+))'))) {
    return formatMessage(settingsMessages.urlError);
  }
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
    setTextError(
      getTextErrors(buttonConfig?.text, errors, formatMessage, tenantLocales)
    );
    // If it depended on buttonConfig, it would be rendered on every URL change (see comment below)
  }, [setTextError, errors, formatMessage, tenantLocales]);

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
          // For the same reason we don't calculate the errors on every render.
          // The same done in front/app/containers/Admin/projects/edit/general/index.tsx  #handleTitleMultilocOnChange
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
        error={getUrlErrors(buttonConfig?.url, errors, formatMessage)}
      />
    </SectionField>
  );
};

export default injectIntl(CustomizedButtonSettings);
