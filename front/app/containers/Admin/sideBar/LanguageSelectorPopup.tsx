import React from 'react';

// components
import { Box, Icon, colors } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';

// i18n
import { useIntl } from 'utils/cl-intl';
import { shortenedAppLocalePairs } from 'containers/App/constants';
import messages from './messages';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// services
import { updateLocale } from 'services/locale';

// styles
import { ItemMenu } from './styles';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getSelectedLocale } from 'containers/MainHeader/LanguageSelector/utils';

interface Props {
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
}

export const LanguageSelectorPopup = ({ setIsOpen, isOpen }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const locale = useLocale();

  if (isNilOrError(appConfig) || isNilOrError(locale)) {
    return null;
  }

  const tenantLocales = appConfig.data.attributes.settings.core.locales;
  const selectedLocale = getSelectedLocale(locale);

  return (
    <Popup
      trigger={
        <Box display="flex" justifyContent="space-between" w="100%">
          {formatMessage({ ...messages.language })}
          <Box display="flex" justifyContent="center" alignItems="center">
            {selectedLocale}
            <Icon name="chevron-right" fill={colors.grey600} />
          </Box>
        </Box>
      }
      open={isOpen}
      onClose={() => setIsOpen(false)}
      on="click"
      position="right center"
      positionFixed
      offset={[0, 30]}
      basic
      wide
    >
      <Box width="172px">
        <>
          {tenantLocales.map((tenantLocale) => (
            <ItemMenu
              key={tenantLocale}
              buttonStyle="text"
              onClick={() => updateLocale(tenantLocale, appConfig)}
            >
              <Box display="flex" justifyContent="space-between" w="100%">
                {shortenedAppLocalePairs[tenantLocale]}
              </Box>
            </ItemMenu>
          ))}
        </>
      </Box>
    </Popup>
  );
};

export default LanguageSelectorPopup;
