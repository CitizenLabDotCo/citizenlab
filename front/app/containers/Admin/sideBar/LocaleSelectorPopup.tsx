import React from 'react';

import {
  Box,
  Dropdown,
  Text,
  useBreakpoint,
  colors,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocale from 'hooks/useLocale';

import { shortenedAppLocalePairs } from 'containers/App/constants';

import { updateLocale } from 'utils/locale';

import { ItemMenu } from './styles';

type Props = {
  isLocaleSelectorOpen: boolean;
  setIsLocaleSelectorOpen: (open: boolean) => void;
  tenantLocales: SupportedLocale[];
};

const LocaleSelectorPopup = ({
  isLocaleSelectorOpen,
  setIsLocaleSelectorOpen,
  tenantLocales,
}: Props) => {
  const locale = useLocale();
  const { data: appConfig } = useAppConfiguration();
  const isSmallerThanPhone = useBreakpoint('tablet');

  return (
    <Box>
      <Dropdown
        opened={isLocaleSelectorOpen}
        onClickOutside={() => {
          setIsLocaleSelectorOpen(false);
        }}
        right={isSmallerThanPhone ? '-260px !important' : '-518px'}
        top="-100px"
        content={
          <Box maxHeight="200px" overflowY="auto">
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
                  onClick={() =>
                    appConfig && updateLocale(tenantLocale, appConfig)
                  }
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
        }
      />
    </Box>
  );
};

export default LocaleSelectorPopup;
