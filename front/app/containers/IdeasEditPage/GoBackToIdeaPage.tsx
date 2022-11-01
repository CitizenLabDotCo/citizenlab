import React from 'react';

// Components
import Button from 'components/UI/Button';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';

// Utils
import { ScreenReaderOnly } from 'utils/a11y';

// Hooks
import useLocalize from 'hooks/useLocalize';

import { IIdeaData } from 'services/ideas';

interface Props {
  idea: IIdeaData;
}

const GoBackToIdeaPage = ({ idea }: Props) => {
  const localize = useLocalize();
  const isPhone = useBreakpoint('phone');

  return (
    <Box
      display="flex"
      width="100%"
      flexDirection="row"
      justifyContent="space-between"
      mb="14px"
      alignItems="center"
      maxWidth="700px"
      px="20px"
    >
      <Button
        icon="arrow-left-circle"
        linkTo={`/ideas/${idea.attributes.slug}`}
        buttonStyle="text"
        iconSize="24px"
        padding="0"
        textDecorationHover="underline"
        whiteSpace="normal"
        data-cy="e2e-back-to-idea-page-button"
      >
        <Box as="span" display={isPhone ? 'none' : 'block'} aria-hidden>
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
