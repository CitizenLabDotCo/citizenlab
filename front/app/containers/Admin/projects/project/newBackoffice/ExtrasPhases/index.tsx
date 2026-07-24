import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import { getPhaseLandingTab } from 'api/phases/utils';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import messages from '../messages';
import {
  PHASE_TAB_ROUTES,
  Row,
  dotBackground,
  dotBorder,
  formatDateRange,
  phaseStatus,
} from '../phaseRowUtils';

import { linkedSurveyPhaseIds } from './linkedSurveyPhaseIds';

interface Props {
  projectId: string;
}

const ExtrasPhases = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false }) as { phaseId?: string };
  const { data: phases } = usePhases(projectId, 'standalone');
  const { data: layout } = useProjectPageLayout(projectId);

  const linkedPhaseIds = linkedSurveyPhaseIds(
    layout?.data.attributes.craftjs_json
  );

  const sortedPhases = [...(phases?.data ?? [])].sort((a, b) =>
    a.attributes.start_at.localeCompare(b.attributes.start_at)
  );

  return (
    <Box p="12px" borderTop={`1px solid ${colors.grey200}`}>
      <Text
        m="0 0 8px 0"
        px="10px"
        fontSize="s"
        fontWeight="bold"
        color="textPrimary"
      >
        {formatMessage(messages.extras)}
      </Text>

      <Box display="flex" flexDirection="column">
        {sortedPhases.map((phase) => {
          const status = phaseStatus(phase);
          const { start_at, end_at } = phase.attributes;
          const dateText = end_at
            ? formatDateRange(start_at, end_at, '')
            : formatMessage(messages.ongoing);
          const onProjectPage = linkedPhaseIds.has(phase.id);

          return (
            <Link
              key={phase.id}
              to={PHASE_TAB_ROUTES[getPhaseLandingTab(phase)]}
              params={{ projectId, phaseId: phase.id }}
            >
              <Row selected={phase.id === phaseId}>
                <Box w="10px" flex="0 0 auto">
                  <Box
                    position="relative"
                    zIndex="1"
                    w="10px"
                    h="10px"
                    borderRadius="50%"
                    mt="3px"
                    background={dotBackground(status)}
                    border={dotBorder(status)}
                  />
                </Box>
                <Box flexGrow={1} pb="4px">
                  <Text
                    as="span"
                    m="0"
                    fontSize="s"
                    color={status === 'past' ? 'textSecondary' : 'textPrimary'}
                  >
                    {localize(phase.attributes.title_multiloc)}
                  </Text>
                  <Text m="2px 0 0 0" fontSize="xs" color="textSecondary">
                    {dateText}
                    {!onProjectPage && (
                      <>
                        {' · '}
                        <Text
                          as="span"
                          m="0"
                          fontSize="xs"
                          color="textSecondary"
                          style={{ textDecoration: 'underline dotted' }}
                        >
                          {formatMessage(messages.notOnProjectPage)}
                        </Text>
                      </>
                    )}
                  </Text>
                </Box>
              </Row>
            </Link>
          );
        })}
      </Box>

      <Box display="flex" mt="4px">
        <ButtonWithLink
          id="e2e-new-extra-survey"
          to="/admin/projects/$projectId/phases/new"
          params={{ projectId }}
          search={{ placement: 'standalone' }}
          buttonStyle="text"
          size="s"
          icon="plus"
          width="auto"
        >
          {formatMessage(messages.newSurvey)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default ExtrasPhases;
