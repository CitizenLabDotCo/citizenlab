import React from 'react';

import { Box, Icon, IconNames, Text, colors } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

import clHistory from 'utils/cl-router/history';

// After a draft lands, the manager should be walked through what was made
// rather than left to hunt for it. These rows deep-link into the real editors
// for each piece (the same routes the result report uses), keeping the current
// search string so the workspace params (e.g. ?live) survive the jump.
interface Props {
  projectId: string;
}

interface ReviewRow {
  icon: IconNames;
  label: string;
  detail: string;
  path: string;
}

const ReviewPanel = ({ projectId }: Props) => {
  const { data: phases } = usePhases(projectId);
  const phaseList = phases?.data ?? [];
  const surveyPhaseId = phaseList.find(
    (phase) => phase.attributes.participation_method === 'native_survey'
  )?.id;
  const firstPhaseId = phaseList[0]?.id;
  const workspaceRoot = `/admin/projects/${projectId}`;

  const go = (path: string) =>
    clHistory.push(`${path}${window.location.search}`);

  const rows: ReviewRow[] = [
    {
      icon: 'file',
      label: 'Project page',
      detail: 'Intro, why it matters, what residents can shape',
      path: `/admin/project-page-builder/projects/${projectId}`,
    },
    ...(surveyPhaseId
      ? [
          {
            icon: 'survey' as IconNames,
            label: 'Survey',
            detail: 'Questions, types and order',
            path: `/admin/projects/${projectId}/phases/${surveyPhaseId}/survey-form/edit`,
          },
        ]
      : []),
    {
      icon: 'calendar',
      label: 'Phases & timeline',
      detail: 'The sequence of participation methods',
      path: firstPhaseId
        ? `/admin/projects/${projectId}/phases/${firstPhaseId}/setup`
        : workspaceRoot,
    },
    {
      icon: 'lock',
      label: 'Access & visibility',
      detail: 'Who can see it and who can take part',
      path: `/admin/projects/${projectId}/general/access-rights`,
    },
  ];

  return (
    <Box
      border={`1px solid ${colors.grey200}`}
      borderRadius="10px"
      overflow="hidden"
    >
      <Box
        p="12px 14px"
        bgColor={colors.teal50}
        display="flex"
        alignItems="center"
        gap="8px"
      >
        <Icon
          name="check-circle"
          width="18px"
          height="18px"
          fill={colors.teal500}
        />
        <Text m="0px" fontWeight="bold" color="textPrimary">
          Draft ready — review each piece
        </Text>
      </Box>

      {rows.map((row, index) => (
        <button
          key={row.label}
          type="button"
          onClick={() => go(row.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 14px',
            border: 'none',
            borderTop: index === 0 ? 'none' : `1px solid ${colors.grey100}`,
            background: colors.white,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Icon
            name={row.icon}
            width="18px"
            height="18px"
            fill={colors.grey700}
          />
          <Box flexGrow={1} minWidth="0">
            <Text m="0px" fontWeight="bold" color="textPrimary">
              {row.label}
            </Text>
            <Text m="0px" fontSize="s" color="textSecondary">
              {row.detail}
            </Text>
          </Box>
          <Icon
            name="arrow-right"
            width="16px"
            height="16px"
            fill={colors.grey600}
          />
        </button>
      ))}
    </Box>
  );
};

export default ReviewPanel;
