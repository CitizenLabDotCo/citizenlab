import React from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import Button from 'components/UI/Button';

import { ScreenReaderOnly } from 'utils/a11y';

interface Props {
  idea: IIdeaData;
}

const GoBackToIdeaPage = ({ idea }: Props) => {
  const localize = useLocalize();
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <Box display="flex" maxWidth="700px">
      <Button
        icon="arrow-left-circle"
        linkTo={`/ideas/${idea.attributes.slug}`}
        scrollToTop
        buttonStyle="text"
        iconSize="28px"
        padding="0"
        textDecorationHover="underline"
        whiteSpace="normal"
        data-cy="e2e-back-to-idea-page-button"
      >
        <Box
          as="span"
          display={isSmallerThanPhone ? 'none' : 'block'}
          aria-hidden
        >
          {localize(idea.attributes.title_multiloc)}
        </Box>
        <ScreenReaderOnly>
          {localize(idea.attributes.title_multiloc)}
        </ScreenReaderOnly>
      </Button>
    </Box>
  );
};

export default GoBackToIdeaPage;
