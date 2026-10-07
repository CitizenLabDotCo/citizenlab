import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import ReviewPanel from './ReviewPanel';

// After a draft lands, the assistant describes what it built (and why, from the
// project's own summary) and hands over the review links — the "describe" half
// of the approve / reject loop. The decision buttons live in the parent so the
// refine flow stays next to the send logic.
const METHOD_LABELS: Record<string, string> = {
  information: 'Information',
  ideation: 'Idea collection',
  proposals: 'Proposals',
  native_survey: 'Survey',
  voting: 'Voting',
  common_ground: 'Common ground',
};

const VISIBILITY_LABELS: Record<string, string> = {
  public: 'anyone who visits',
  groups: 'specific groups',
  admins: 'admins only',
};

const daysBetween = (start: string, end: string | null) => {
  if (!end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
};

interface Props {
  projectId: string;
}

const DraftReview = ({ projectId }: Props) => {
  const localize = useLocalize();
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const steps = (phases?.data ?? []).map((phase) => {
    const method = phase.attributes.participation_method;
    const label = METHOD_LABELS[method] ?? method;
    const days = daysBetween(phase.attributes.start_at, phase.attributes.end_at);
    return days ? `${label} (${days} days)` : label;
  });

  const why = project
    ? localize(project.data.attributes.description_preview_multiloc)
    : '';
  const visibility = project
    ? VISIBILITY_LABELS[project.data.attributes.visible_to]
    : undefined;

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <Box display="flex" gap="8px" alignItems="flex-start">
        <Box
          flex="0 0 auto"
          width="28px"
          height="28px"
          borderRadius="50%"
          bgColor={colors.teal50}
          display="flex"
          alignItems="center"
          justifyContent="center"
          mt="2px"
        >
          <Icon name="stars" width="16px" height="16px" fill={colors.teal500} />
        </Box>
        <Box
          flex="1"
          minWidth="0"
          p="12px 14px"
          borderRadius="4px 14px 14px 14px"
          bgColor={colors.grey100}
        >
          <Text m="0px" fontWeight="bold" color="textPrimary">
            Here’s the project I drafted
          </Text>
          {why && (
            <Text m="6px 0 0" color="textPrimary" lineHeight="1.5">
              {why}
            </Text>
          )}
          {steps.length > 0 && (
            <>
              <Text m="10px 0 2px" fontSize="s" fontWeight="bold" color="textSecondary">
                The plan
              </Text>
              <Text m="0px" color="textPrimary" lineHeight="1.5">
                {steps.join('  →  ')}
              </Text>
            </>
          )}
          {visibility && (
            <Text m="8px 0 0" fontSize="s" color="textSecondary">
              Open to {visibility}.
            </Text>
          )}
        </Box>
      </Box>

      <ReviewPanel projectId={projectId} />
    </Box>
  );
};

export default DraftReview;
