import React from 'react';

import {
  Box,
  Button,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import { IdeaMiniData } from 'api/user_survey_submissions/types';

import useLocalize from 'hooks/useLocalize';

import Container from 'components/IdeaCard/Container';

import Link from 'utils/cl-router/Link';

import { downloadSurveySubmission } from '../utils';

interface Props {
  ideaMini: IdeaMiniData;
}

const SurveySubmissionCard = ({ ideaMini }: Props) => {
  const { data: phase } = usePhase(
    ideaMini.relationships.creation_phase.data.id
  );
  const smallerThanTablet = useBreakpoint('tablet');
  const localize = useLocalize();

  const handleClick = () => {
    downloadSurveySubmission(ideaMini.id);
  };

  const slug = 'TODO';

  if (!phase) return null;

  return (
    <Container>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        w="100%"
        // Height of 100% needed to extent the card to the bottom of the row when there
        // is a card with an image and a card without an image in the same row.
        h="100%"
        overflowX="hidden"
      >
        <Box mb={smallerThanTablet ? '24px' : '8px'}>
          <Link to={`/ideas/${slug}?go_back=true`} onClick={handleClick}>
            <Title
              variant="h3"
              mt="4px"
              mb="16px"
              className="e2e-idea-card-title"
            >
              {localize(phase.data.attributes.title_multiloc)}
            </Title>
            {/* {!hideBody && <Body idea={idea} />} */}
          </Link>
        </Box>
        <Box marginTop="auto">
          <Button w="auto" onClick={handleClick}>
            Click here to download
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SurveySubmissionCard;
