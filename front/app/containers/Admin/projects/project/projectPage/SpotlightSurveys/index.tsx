import React from 'react';

import {
  Box,
  Text,
  Title,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';

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
  PhaseDot,
  Row,
  formatDateRange,
  phaseStatus,
} from '../phaseRowUtils';

import { linkedSurveyPhaseIds } from './linkedSurveyPhaseIds';

interface Props {
  projectId: string;
  variant?: 'sidebar' | 'backofficeRedesign';
}

const SpotlightSurveys = ({ projectId, variant = 'sidebar' }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false });
  const { data: phases } = usePhases(projectId, 'standalone');
  const { data: layout } = useProjectPageLayout(projectId);

  const linkedPhaseIds = linkedSurveyPhaseIds(
    layout?.data.attributes.craftjs_json
  );

  const sortedPhases = [...(phases?.data ?? [])].sort((a, b) =>
    a.attributes.start_at.localeCompare(b.attributes.start_at)
  );

  const redesign = variant === 'backofficeRedesign';

  if (redesign && sortedPhases.length === 0) return null;

  return (
    <Box
      className="intercom-product-tour-project-extras"
      p={redesign ? '0' : '12px'}
      borderTop={redesign ? 'none' : `1px solid ${colors.grey200}`}
    >
      {redesign ? (
        <>
          <Box mx="8px" my="24px" borderTop={`1px solid ${colors.grey200}`} />
          <Box px="8px" mb="12px">
            <Title variant="h4" fontSize="s" fontWeight="semi-bold" m="0">
              {formatMessage(messages.extras)}
            </Title>
          </Box>
        </>
      ) : (
        <Text
          m="0 0 8px 0"
          px="10px"
          fontSize="s"
          fontWeight="bold"
          color="textPrimary"
        >
          {formatMessage(messages.extras)}
        </Text>
      )}

      <Box display="flex" flexDirection="column">
        {sortedPhases.map((phase) => {
          const status = phaseStatus(phase);
          const { start_at, end_at } = phase.attributes;
          const dateText = end_at
            ? formatDateRange(start_at, end_at)
            : formatMessage(messages.ongoing);
          const onProjectPage = linkedPhaseIds.has(phase.id);

          return (
            <Link
              key={phase.id}
              to={PHASE_TAB_ROUTES[getPhaseLandingTab(phase)]}
              params={{ projectId, phaseId: phase.id }}
            >
              <Row selected={phase.id === phaseId}>
                <PhaseDot status={status} />
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
        {redesign ? (
          <ButtonWithLink
            className="intercom-product-tour-project-new-survey-button"
            to="/admin/projects/$projectId/phases/new"
            params={{ projectId }}
            search={{ placement: 'standalone' }}
            buttonStyle="bo-text"
            height="32px"
            padding="0 8px"
            fontSize={`${fontSizes.xs}px`}
            icon="plus"
            width="auto"
          >
            {formatMessage(messages.newSurvey)}
          </ButtonWithLink>
        ) : (
          <ButtonWithLink
            className="intercom-product-tour-project-new-survey-button"
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
        )}
      </Box>
    </Box>
  );
};

export default SpotlightSurveys;
