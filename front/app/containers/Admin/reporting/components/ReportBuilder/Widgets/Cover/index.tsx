import React from 'react';

import { Box, Text, Title, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';
import { Multiloc } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';

export interface Props {
  title?: Multiloc;
  subtitle?: Multiloc;
  eyebrow?: Multiloc;
  footnote?: Multiloc;
  showLogo?: boolean;
}

// Tall enough to hold the page on its own, short enough to stay inside one:
// an A4 page has 263mm of content between the print margins, and a cover that
// overran it would take a second, near-empty page with it.
const COVER_HEIGHT = '255mm';

const Cover = ({
  title,
  subtitle,
  eyebrow,
  footnote,
  showLogo = true,
}: Props) => {
  const theme = useTheme();
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();

  const accent = theme.colors.tenantPrimary;
  const logoUrl = appConfiguration?.data.attributes.logo?.medium;
  const tenantName = appConfiguration?.data.attributes.name;

  const titleText = localize(title);
  const eyebrowText =
    localize(eyebrow) || formatMessage(messages.defaultEyebrow);

  return (
    <Box
      className="e2e-report-cover"
      minHeight={COVER_HEIGHT}
      display="flex"
      flexDirection="column"
      // The cover is a page, so it never shares one.
      style={{ breakInside: 'avoid' }}
    >
      <Box w="100%" h="4px" background={accent} mb="28px" />

      <Text
        m="0 0 40px"
        fontSize="s"
        color="textSecondary"
        style={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}
      >
        {eyebrowText}
      </Text>

      {showLogo && logoUrl && (
        <Box>
          <img
            src={logoUrl}
            alt={tenantName ?? ''}
            style={{ maxHeight: '56px', maxWidth: '60%' }}
          />
        </Box>
      )}

      {/* The two spacers sit the title a little above the middle of the page,
          which is where a title page reads best. */}
      <Box flexGrow={1} minHeight="32px" />

      <Title
        variant="h1"
        m="0"
        color="tenantPrimary"
        style={{ fontSize: '40px', lineHeight: 1.15 }}
      >
        {titleText || formatMessage(messages.titlePlaceholder)}
      </Title>

      {localize(subtitle) && (
        <Text m="16px 0 0" fontSize="xl" color="textSecondary">
          {localize(subtitle)}
        </Text>
      )}

      <Box flexGrow={1.2} minHeight="32px" />

      <Box w="100%" h="1px" background={colors.divider} mb="12px" />

      <Box display="flex" justifyContent="space-between" gap="16px">
        <Text m="0" fontSize="s" color="textSecondary">
          {tenantName}
        </Text>
        <Text m="0" fontSize="s" color="textSecondary">
          {localize(footnote)}
        </Text>
      </Box>
    </Box>
  );
};

Cover.craft = {
  props: {
    title: {},
    subtitle: {},
    eyebrow: {},
    footnote: {},
    showLogo: true,
  },
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.cover,
  },
};

export const coverTitle = messages.cover;

export default Cover;
