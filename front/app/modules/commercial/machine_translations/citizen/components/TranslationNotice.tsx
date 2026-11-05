import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { getLocaleDisplayName } from 'components/UI/MultilocTranslation/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const ToggleButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  text-decoration: underline;
  white-space: nowrap;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;
  background: none;

  &:hover {
    color: ${colors.textPrimary};
  }
`;

interface Props {
  // The original multiloc. The back end translates from its first locale.
  multiloc: Multiloc;
  showTranslation: boolean;
  onToggle: () => void;
}

// "Translated from Dutch · Show original", or "Show translation".
const TranslationNotice = ({ multiloc, showTranslation, onToggle }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales() ?? [];
  const sourceLocale = tenantLocales.find(
    (tenantLocale) => tenantLocale === Object.keys(multiloc)[0]
  );

  return (
    <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
      <Icon
        name="translate"
        width="16px"
        height="16px"
        fill={colors.textSecondary}
      />
      {showTranslation && sourceLocale && (
        <Text as="span" m="0" fontSize="s" color="textSecondary">
          {formatMessage(messages.translatedFrom, {
            language: getLocaleDisplayName(sourceLocale, locale),
          })}{' '}
          ·
        </Text>
      )}
      <ToggleButton type="button" onClick={onToggle}>
        {formatMessage(
          showTranslation ? messages.showOriginal : messages.showTranslation
        )}
      </ToggleButton>
    </Box>
  );
};

export default TranslationNotice;
