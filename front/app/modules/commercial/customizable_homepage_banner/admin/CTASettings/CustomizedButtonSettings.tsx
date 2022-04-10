import { isEmpty } from 'lodash-es';
import { Input, Label } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import React, { useEffect, useMemo, useState } from 'react';
import { CustomizedButtonConfig } from 'services/appConfiguration';
import { CLErrors, Multiloc, Locale } from 'typings';
import messages from '../messages';
import genericMessages from 'components/UI/Error/messages';
import settingsMessages from 'containers/Admin/settings/messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

const TextSettings = styled.div`
  margin-top: 10px;
  margin-bottom: 15px;
`;

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
  formatMessage: (messageDescriptor, values?) => string,
  tenantLocales: Locale[] | undefined | null | Error
) => {
  const textErrors: Multiloc = {};

  // Prevent displaying errors on the first render.
  if (isEmpty(errors)) {
    return textErrors;
  }

  if (!isNilOrError(tenantLocales)) {
    tenantLocales.forEach((locale) => {
      if (isEmpty(textMultiloc?.[locale])) {
        textErrors[locale] = formatMessage(genericMessages.blank);
      }
    });
  }

  return textErrors;
};

const getUrlErrors = (
  url: string | undefined,
  errors: CLErrors,
  formatMessage: (messageDescriptor, values?) => string
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

  return null;
};

interface Props {
  buttonConfig?: CustomizedButtonConfig;
  handleSettingOnChange: (settingKey: string, settingValue: any) => void;
  signInStatus: 'signed_out' | 'signed_in';
  errors: CLErrors;
  className?: string;
}

const CustomizedButtonSettings = ({
  buttonConfig,
  handleSettingOnChange,
  signInStatus,
  errors,
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const customizedButtonKey = `cta_${signInStatus}_customized_button`;
  const handleOnChange =
    (buttonKey: keyof CustomizedButtonConfig) => (value: any) => {
      handleSettingOnChange(customizedButtonKey, {
        ...buttonConfig,
        [buttonKey]: value,
      });
    };
  const handleTextOnChange = (textMultiloc: Multiloc) => {
    handleOnChange('text')(textMultiloc);
    // We set it to {} because if it's set to the current error and there are two empty locale inputs,
    // cursor jumps to the next empty locale input after typing the first letter in the first empty locale input.
    // For the same reason we don't calculate the errors on every render.
    // The same done in front/app/containers/Admin/projects/edit/general/index.tsx  #handleTitleMultilocOnChange
    setTextError({});
  };
  const handleUrlOnChange = (url: string) => handleOnChange('url')(url);

  const tenantLocales = useAppConfigurationLocales();
  const [textErrors, setTextError] = useState<Multiloc>({});

  const memedTextErrors = useMemo(
    () =>
      getTextErrors(buttonConfig?.text, errors, formatMessage, tenantLocales),
    // if it depends on buttonConfig, cursor jumps to the next empty locale input (see comment in text onChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errors, formatMessage, tenantLocales]
  );
  useEffect(() => setTextError(memedTextErrors), [memedTextErrors]);

  return (
    <SectionField className={className}>
      <TextSettings>
        <InputMultilocWithLocaleSwitcher
          data-testid="inputMultilocLocaleSwitcher"
          type="text"
          valueMultiloc={buttonConfig?.text}
          label={
            <FormattedMessage {...messages.customized_button_text_label} />
          }
          onChange={handleTextOnChange}
          // we need it null and not {} to make an error disappear after entering a valid value
          errorMultiloc={!isEmpty(textErrors) ? textErrors : null}
        />
      </TextSettings>
      <Label>
        <FormattedMessage {...messages.customized_button_url_label} />
      </Label>
      <Input
        data-testid="buttonConfigInput"
        type="text"
        placeholder="https://..."
        onChange={handleUrlOnChange}
        value={buttonConfig?.url}
        error={getUrlErrors(buttonConfig?.url, errors, formatMessage)}
      />
    </SectionField>
  );
};

export default injectIntl(CustomizedButtonSettings);
