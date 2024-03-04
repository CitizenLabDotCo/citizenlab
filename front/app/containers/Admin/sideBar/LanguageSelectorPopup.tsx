import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { shortenedAppLocalePairs } from 'containers/App/constants';
import { getSelectedLocale } from 'containers/MainHeader/Components/LanguageSelector/utils';
import { rgba } from 'polished';
import { Popup } from 'semantic-ui-react';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { updateLocale } from 'utils/locale';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import messages from './messages';

// styles
import { ItemMenu } from './styles';

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
          <Text my="0px" color="coolGrey600">
            {formatMessage({ ...messages.language })}
          </Text>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Text my="0px" color="coolGrey600">
              {selectedLocale}
            </Text>
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
        {tenantLocales.map((tenantLocale, index) => {
          const isLastLocale = index === tenantLocales.length - 1;

          return (
            <ItemMenu
              bgColor={`${
                tenantLocale === locale ? rgba(colors.teal400, 0.07) : ''
              }`}
              mb={isLastLocale ? '0px' : '4px'}
              key={tenantLocale}
              buttonStyle="text"
              onClick={() => updateLocale(tenantLocale, appConfig)}
            >
              <Box display="flex" justifyContent="space-between" w="100%">
                <Text my="0px" color="coolGrey600">
                  {shortenedAppLocalePairs[tenantLocale]}
                </Text>
              </Box>
            </ItemMenu>
          );
        })}
      </Box>
    </Popup>
  );
};

export default LanguageSelectorPopup;
