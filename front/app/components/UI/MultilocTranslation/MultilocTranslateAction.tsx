import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { MultilocTranslation } from './useMultilocTranslation';
import { getLocaleDisplayName } from './utils';

interface Props {
  translation: MultilocTranslation;
  // A string, because the component library types locales as strings.
  selectedLocale: string;
}

// Compact buttons next to the locale switcher of a multiloc input.
const MultilocTranslateAction = ({ translation, selectedLocale }: Props) => {
  const { formatMessage } = useIntl();
  const uiLocale = useLocale();
  const { enabled, sourceLocale, emptyLocales, isLoading, translate } =
    translation;

  if (!enabled || !sourceLocale || emptyLocales.length === 0) return null;

  const emptySelectedLocale = emptyLocales.find(
    (locale) => locale === selectedLocale
  );
  const otherLocalesAreEmpty = emptyLocales.some(
    (locale) => locale !== selectedLocale
  );

  const buttonProps = {
    type: 'button',
    buttonStyle: 'text',
    icon: 'translate',
    size: 's',
    padding: '0px',
    iconSize: '16px',
    textColor: colors.teal700,
    iconColor: colors.teal700,
    processing: isLoading,
  } as const;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="12px"
      flexWrap="wrap"
      mr="12px"
    >
      {emptySelectedLocale && (
        <Button
          {...buttonProps}
          className="e2e-multiloc-translate-from"
          onClick={() => translate([emptySelectedLocale])}
        >
          {formatMessage(messages.translateFrom, {
            language: getLocaleDisplayName(sourceLocale, uiLocale),
          })}
        </Button>
      )}
      {otherLocalesAreEmpty && (
        <Button
          {...buttonProps}
          className="e2e-multiloc-translate-all"
          onClick={() => translate(emptyLocales)}
        >
          {formatMessage(messages.translateToAllEmptyLanguages)}
        </Button>
      )}
    </Box>
  );
};

export default MultilocTranslateAction;
