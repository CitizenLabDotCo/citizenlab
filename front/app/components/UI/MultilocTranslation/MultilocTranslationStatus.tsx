import React from 'react';

import {
  Box,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { MultilocTranslation } from './useMultilocTranslation';
import { getLanguageName } from './utils';

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 6px;
  margin-top: 6px;
  font-size: ${fontSizes.s}px;
  line-height: 20px;
  color: ${colors.textSecondary};
`;

const ActionButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: ${colors.teal700};
  font-size: ${fontSizes.s}px;
  line-height: 20px;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${colors.teal500};
  }

  &:disabled {
    color: ${colors.textSecondary};
    cursor: default;
  }
`;

const Separator = () => <span aria-hidden="true">·</span>;

// The same dots as the locale switcher, so the line explains them.
const StateDot = styled.span<{ state: 'machine' | 'stale' }>`
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  ${({ state }) => {
    const color = state === 'machine' ? colors.success : colors.orange500;
    return `
      background: linear-gradient(90deg, ${color} 50%, ${colors.white} 50%);
      box-shadow: 0 0 0 1px ${color};
    `;
  }}
`;

interface Props {
  translation: MultilocTranslation;
  // A string, because the component library types locales as strings.
  selectedLocale: string;
}

// One line under a multiloc input: the translation state of the selected locale, and the
// translate actions that make sense for it.
const MultilocTranslationStatus = ({ translation, selectedLocale }: Props) => {
  const { formatMessage } = useIntl();
  const uiLocale = useLocale();
  const {
    enabled,
    sourceLocale,
    emptyLocales,
    staleLocales,
    localeStates,
    translatedFrom,
    isLoading,
    isError,
    translate,
  } = translation;

  if (!enabled || !sourceLocale) return null;

  const locale = selectedLocale as SupportedLocale;
  const state = localeStates[locale];
  const languageName = (l: SupportedLocale) => getLanguageName(l, uiLocale);
  const sourceName = languageName(translatedFrom(locale) ?? sourceLocale);
  const otherEmptyLocales = emptyLocales.filter((l) => l !== locale);

  if (isLoading) {
    return (
      <Row role="status">
        <Icon name="translate" width="14px" height="14px" fill="currentColor" />
        {formatMessage(messages.translating)}
      </Row>
    );
  }

  const error = isError ? (
    <Box as="span" color={colors.red600}>
      {formatMessage(messages.translationFailed)}
    </Box>
  ) : null;

  if (state === 'machine' || state === 'stale') {
    return (
      <Row>
        <StateDot state={state} aria-hidden="true" />
        <span>
          {formatMessage(
            state === 'machine'
              ? messages.machineTranslationFrom
              : messages.sourceChanged,
            { language: sourceName }
          )}
        </span>
        <Separator />
        <ActionButton type="button" onClick={() => translate([locale])}>
          {formatMessage(messages.translateAgain)}
        </ActionButton>
        {error}
      </Row>
    );
  }

  if (emptyLocales.includes(locale)) {
    return (
      <Row>
        <Icon name="translate" width="14px" height="14px" fill="currentColor" />
        <span>
          {formatMessage(messages.noTextYet, {
            language: languageName(locale),
          })}
        </span>
        <ActionButton
          type="button"
          className="e2e-multiloc-translate-from"
          onClick={() => translate([locale])}
        >
          {formatMessage(messages.translateFrom, { language: sourceName })}
        </ActionButton>
        {otherEmptyLocales.length > 0 && (
          <>
            <Separator />
            <ActionButton
              type="button"
              className="e2e-multiloc-translate-all"
              onClick={() => translate(emptyLocales)}
            >
              {formatMessage(messages.translateAllEmpty, {
                count: emptyLocales.length,
              })}
            </ActionButton>
          </>
        )}
        {error}
      </Row>
    );
  }

  // The selected locale has text that a person wrote.
  if (emptyLocales.length === 0 && staleLocales.length === 0) return error;

  return (
    <Row>
      <Icon name="translate" width="14px" height="14px" fill="currentColor" />
      {emptyLocales.length > 0 && (
        <ActionButton
          type="button"
          className="e2e-multiloc-translate-all"
          onClick={() => translate(emptyLocales)}
        >
          {emptyLocales.length === 1
            ? formatMessage(messages.translateTo, {
                language: languageName(emptyLocales[0]),
              })
            : formatMessage(messages.translateAllEmpty, {
                count: emptyLocales.length,
              })}
        </ActionButton>
      )}
      {emptyLocales.length > 0 && staleLocales.length > 0 && <Separator />}
      {staleLocales.length > 0 && (
        <ActionButton type="button" onClick={() => translate(staleLocales)}>
          {formatMessage(messages.updateOutdated, {
            count: staleLocales.length,
          })}
        </ActionButton>
      )}
      {error}
    </Row>
  );
};

export default MultilocTranslationStatus;
