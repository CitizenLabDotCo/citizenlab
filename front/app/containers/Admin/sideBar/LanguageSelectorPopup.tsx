import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { getSelectedLocale } from 'containers/MainHeader/Components/LanguageSelector/utils';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

interface Props {
  setIsLocaleSelectorOpen: (open: boolean) => void;
  isLocaleSelectorOpen: boolean;
}

export const LanguageSelectorPopup = ({
  setIsLocaleSelectorOpen,
  isLocaleSelectorOpen,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const locale = useLocale();

  if (isNilOrError(appConfig) || isNilOrError(locale)) {
    return null;
  }

  const selectedLocale = getSelectedLocale(locale);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        onClick={() => {
          setIsLocaleSelectorOpen(!isLocaleSelectorOpen);
        }}
      >
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
    </>
  );
};

export default LanguageSelectorPopup;
