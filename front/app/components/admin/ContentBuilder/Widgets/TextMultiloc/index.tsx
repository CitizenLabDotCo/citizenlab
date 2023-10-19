import React from 'react';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import QuillMutilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import PageBreakBox from '../PageBreakBox';
import { Box } from '@citizenlab/cl2-component-library';

// craft
import { useNode } from '@craftjs/core';

// i18n
import messages from './messages';

// hooks
import { useTheme } from 'styled-components';
import { Multiloc, Locale } from 'typings';
import { getLocalizedWithFallback } from 'utils/i18n';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { useIntl } from 'utils/cl-intl';

interface Props {
  text: Multiloc;
}

const TextMultiloc = ({ text }: Props) => {
  const theme = useTheme();
  const { locale } = useIntl() as { locale: Locale };
  const tenantLocales = useAppConfigurationLocales();

  const value = getLocalizedWithFallback(text, locale, tenantLocales);

  return (
    <PageBreakBox id="e2e-text-box" minHeight="26px">
      <QuillEditedContent textColor={theme.colors.tenantText}>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </QuillEditedContent>
    </PageBreakBox>
  );
};

const TextMultilocSettings = () => {
  const {
    actions: { setProp },
    text,
  } = useNode((node) => ({
    text: node.data.props.text,
  }));

  return (
    <Box background="#ffffff" marginBottom="20px">
      <QuillMutilocWithLocaleSwitcher
        maxHeight="300px"
        noImages
        noVideos
        id="quill-editor"
        valueMultiloc={text}
        onChange={(value) => {
          setProp((props: Props) => (props.text = value));
        }}
      />
    </Box>
  );
};

TextMultiloc.craft = {
  props: {
    text: {},
  },
  related: {
    settings: TextMultilocSettings,
  },
  custom: {
    title: messages.text,
  },
};

export default TextMultiloc;
