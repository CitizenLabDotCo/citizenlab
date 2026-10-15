import React from 'react';

import { Box, Icon, IconNames, Spinner, Text, colors } from '@citizenlab/cl2-component-library';
import { format } from 'date-fns';

import usePhases from 'api/phases/usePhases';
import { ParticipationMethod } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

// The right half of the assistant modal: the project the engine actually
// generated, shown the way a manager will see it. Draft only — no resident
// preview tab. All data is live from the created project (page, phases).

const METHOD_LABELS: Record<string, string> = {
  information: 'Information',
  ideation: 'Idea collection',
  proposals: 'Proposals',
  native_survey: 'Survey',
  survey: 'Survey',
  voting: 'Voting',
  poll: 'Poll',
  volunteering: 'Volunteering',
  document_annotation: 'Document',
  common_ground: 'Common ground',
};

const METHOD_ICONS: Record<string, IconNames> = {
  information: 'info-outline',
  ideation: 'idea',
  proposals: 'idea',
  native_survey: 'survey',
  survey: 'survey',
  voting: 'survey',
  poll: 'survey',
  volunteering: 'survey',
  document_annotation: 'page',
  common_ground: 'idea',
};

const STREET_WASH =
  'linear-gradient(135deg, #b9cbb0 0%, #8aa98c 45%, #6b7f74 100%)';

const formatDates = (start: string, end: string | null) => {
  const startText = format(new Date(start), 'd MMM');
  if (!end) return `From ${startText}`;
  return `${startText} – ${format(new Date(end), 'd MMM')}`;
};

const PhaseRow = ({
  method,
  title,
  description,
  dates,
  withBorder,
}: {
  method: ParticipationMethod;
  title: string;
  description: string;
  dates: string;
  withBorder: boolean;
}) => (
  <Box py="16px" borderTop={withBorder ? `1px solid ${colors.grey200}` : undefined}>
    <Box display="flex" gap="14px" alignItems="flex-start">
      <Box
        flex="0 0 auto"
        width="36px"
        height="36px"
        borderRadius="8px"
        bgColor={colors.grey100}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Icon name={METHOD_ICONS[method] ?? 'survey'} width="18px" height="18px" fill={colors.grey700} />
      </Box>
      <Box flex="1" minWidth="0">
        <Text m="0px" fontWeight="bold" color="textPrimary" lineHeight="1.3">
          {title}
        </Text>
        <Text m="2px 0 0" fontSize="s" color="textSecondary">
          {METHOD_LABELS[method] ?? method} · {dates}
        </Text>
        {description && (
          <Text m="8px 0 0" color="textSecondary" lineHeight="1.45">
            {description}
          </Text>
        )}
      </Box>
    </Box>
  </Box>
);

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <Box bgColor={colors.white} border={`1px solid ${colors.grey200}`} borderRadius="14px" p="20px 24px">
    {children}
  </Box>
);

type Props = { projectId: string };

const DraftPreviewPane = ({ projectId }: Props) => {
  const localize = useLocalize();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || !phases) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Box>
    );
  }

  const attrs = project.data.attributes;
  const title = localize(attrs.title_multiloc);
  const description = localize(attrs.description_preview_multiloc);
  const image =
    typeof attrs.header_bg === 'object' ? attrs.header_bg?.large : undefined;
  const phaseList = phases.data;

  return (
    <Box flex="1" minHeight="0" overflowY="auto" px="32px" py="24px">
      <Box display="flex" flexDirection="column" gap="28px">
        <Box>
          <Text m="0 0 14px" fontSize="l" fontWeight="bold" color="textPrimary">
            Project setup
          </Text>
          <SectionCard>
            <Box display="flex" gap="24px">
              <Box
                flex="0 0 220px"
                height="150px"
                borderRadius="10px"
                style={{
                  background: image ? `center/cover no-repeat url(${image})` : STREET_WASH,
                }}
              />
              <Box flex="1" minWidth="0">
                <Text m="0px" fontSize="s" color="textSecondary">
                  Project page and homepage card
                </Text>
                <Text m="6px 0 0" fontSize="xl" fontWeight="bold" color="textPrimary" lineHeight="1.2">
                  {title || 'Untitled project'}
                </Text>
                {description && (
                  <Text m="10px 0 0" color="textSecondary" lineHeight="1.5">
                    {description}
                  </Text>
                )}
              </Box>
            </Box>
          </SectionCard>
        </Box>

        <Box>
          <Text m="0 0 14px" fontSize="l" fontWeight="bold" color="textPrimary">
            Participation methods
          </Text>
          <SectionCard>
            {phaseList.length === 0 ? (
              <Text m="0px" color="textSecondary">
                No phases were created.
              </Text>
            ) : (
              phaseList.map((phase, i) => (
                <PhaseRow
                  key={phase.id}
                  method={phase.attributes.participation_method}
                  title={localize(phase.attributes.title_multiloc) || `Phase ${i + 1}`}
                  description={localize(phase.attributes.description_multiloc)}
                  dates={formatDates(phase.attributes.start_at, phase.attributes.end_at)}
                  withBorder={i !== 0}
                />
              ))
            )}
          </SectionCard>
        </Box>
      </Box>
    </Box>
  );
};

export default DraftPreviewPane;
