import React from 'react';

import {
  Box,
  Button,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import { IdeaMiniData } from 'api/user_survey_submissions/types';

import useLocalize from 'hooks/useLocalize';

import Container from 'components/IdeaCard/Container';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

import { downloadSurveySubmission } from '../utils';

import Body from './Body';
import messages from './messages';

interface Props {
  ideaMini: IdeaMiniData;
}

const SurveySubmissionCard = ({ ideaMini }: Props) => {
  const { data: phase } = usePhase(
    ideaMini.relationships.creation_phase.data.id
  );
  const { data: project } = useProjectById(
    ideaMini.relationships.project.data.id
  );

  const smallerThanTablet = useBreakpoint('tablet');
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const handleClickDownload = () => {
    downloadSurveySubmission(ideaMini.id);
  };

  if (!phase || !project) return null;

  const { slug } = project.data.attributes;

  const projectUrl = `/projects/${slug}` satisfies RouteType;

  const handleClickCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    clHistory.push(projectUrl);
  };

  return (
    <Container onClick={handleClickCard}>
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
          <Link to={projectUrl}>
            <Title
              variant="h3"
              mt="4px"
              mb="16px"
              className="e2e-idea-card-title"
            >
              {localize(phase.data.attributes.title_multiloc)}
            </Title>
            <Body ideaMini={ideaMini} />
          </Link>
        </Box>
        <Box marginTop="auto">
          <Button w="auto" onClick={handleClickDownload} buttonStyle="text">
            {formatMessage(messages.downloadYourResponses)}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SurveySubmissionCard;
