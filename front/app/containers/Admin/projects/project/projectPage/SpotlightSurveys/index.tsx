import React from 'react';

import { Box, Text, bo, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import { getPhaseLandingTab } from 'api/phases/utils';
import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import { getLocale } from 'components/admin/DatePickers/_shared/locales';
import { linkedSurveyPhaseIds } from 'components/ProjectPageBuilder/Widgets/SpotlightSurveys/linkedSurveyPhaseIds';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import messages from '../messages';
import {
  PHASE_TAB_ROUTES,
  PhaseDot,
  Row,
  SurveyDot,
  SurveyMeta,
  SurveyRow,
  SurveyTitle,
  formatDatePair,
  formatDateRange,
  phaseStatus,
} from '../phaseRowUtils';
import PhaseOptionsMenu from '../TimelinePhases/PhaseOptionsMenu';
import PhaseRowWithOptions from '../TimelinePhases/PhaseRowWithOptions';

interface Props {
  projectId: string;
  withPhaseOptions?: boolean;
  variant?: 'sidebar' | 'backofficeRedesign';
}

const SpotlightSurveys = ({
  projectId,
  withPhaseOptions = false,
  variant = 'sidebar',
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const dateLocale = getLocale(useLocale());
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
  const RowElement = redesign ? SurveyRow : Row;
  const MetaElement = redesign ? SurveyMeta : Text;
  const formatSidebarDates = (startAt: string, endAt: string | null) =>
    endAt
      ? formatDateRange(startAt, endAt, dateLocale)
      : formatMessage(messages.ongoing);

  if (redesign && sortedPhases.length === 0) return null;

  return (
    <Box
      className="intercom-product-tour-project-extras"
      p={redesign ? '0' : '12px'}
      borderTop={redesign ? 'none' : `1px solid ${colors.grey200}`}
    >
      {redesign ? (
        <Box px="12px" mt="32px" mb="12px">
          <Box as="h4" m="0">
            <Text as="span" variant="boSection" m="0">
              {formatMessage(messages.extras)}
            </Text>
          </Box>
        </Box>
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
          const dateText = redesign
            ? formatDatePair(
                start_at,
                end_at,
                'd MMM yyyy',
                dateLocale,
                formatMessage(messages.ongoing)
              )
            : formatSidebarDates(start_at, end_at);
          const onProjectPage = linkedPhaseIds.has(phase.id);
          const title = localize(phase.attributes.title_multiloc);

          const row = (
            <Link
              to={PHASE_TAB_ROUTES[getPhaseLandingTab(phase)]}
              params={{ projectId, phaseId: phase.id }}
            >
              <RowElement selected={phase.id === phaseId}>
                {redesign ? (
                  <SurveyDot status={status} />
                ) : (
                  <PhaseDot status={status} />
                )}
                <Box
                  flexGrow={1}
                  pb={redesign ? '0' : '4px'}
                  pr={withPhaseOptions ? '24px' : undefined}
                >
                  {redesign ? (
                    <SurveyTitle
                      style={{
                        color:
                          status === 'past'
                            ? colors.coolGrey600
                            : bo.colors.textHeadingStrong,
                      }}
                    >
                      {title}
                    </SurveyTitle>
                  ) : (
                    <Text
                      as="span"
                      m="0"
                      fontSize="s"
                      color={
                        status === 'past' ? 'textSecondary' : 'textPrimary'
                      }
                    >
                      {title}
                    </Text>
                  )}
                  <MetaElement
                    m="2px 0 0 0"
                    fontSize="xs"
                    color="textSecondary"
                  >
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
                  </MetaElement>
                </Box>
              </RowElement>
            </Link>
          );

          return withPhaseOptions ? (
            <PhaseRowWithOptions
              key={phase.id}
              options={<PhaseOptionsMenu projectId={projectId} phase={phase} />}
            >
              {row}
            </PhaseRowWithOptions>
          ) : (
            <React.Fragment key={phase.id}>{row}</React.Fragment>
          );
        })}
      </Box>

      {!redesign && (
        <Box display="flex" mt="4px">
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
        </Box>
      )}
    </Box>
  );
};

export default SpotlightSurveys;
