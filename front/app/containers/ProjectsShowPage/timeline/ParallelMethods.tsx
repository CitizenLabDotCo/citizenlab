import React from 'react';

import {
  Box,
  Button,
  Icon,
  IconNames,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import { IPhaseMethodData, ParticipationMethod } from 'api/phases/types';
import usePhaseMethods from 'api/phases/usePhaseMethods';
import useProjectById from 'api/projects/useProjectById';

import clHistory from 'utils/cl-router/history';
import { pastPresentOrFuture } from 'utils/dateUtils';

const METHOD_LABELS: Record<ParticipationMethod, string> = {
  ideation: 'Ideation',
  common_ground: 'Common ground',
  information: 'Information',
  native_survey: 'Survey',
  community_monitor_survey: 'Community monitor survey',
  survey: 'External survey',
  voting: 'Voting',
  poll: 'Poll',
  volunteering: 'Volunteering',
  document_annotation: 'Document annotation',
  proposals: 'Proposals',
};

const METHOD_ICONS: Record<ParticipationMethod, IconNames> = {
  ideation: 'idea',
  common_ground: 'idea',
  information: 'info-outline',
  native_survey: 'survey-long-answer',
  community_monitor_survey: 'survey-long-answer',
  survey: 'survey-long-answer',
  voting: 'vote-ballot',
  poll: 'survey-long-answer',
  volunteering: 'volunteer',
  document_annotation: 'survey-long-answer',
  proposals: 'idea',
};

const Wrapper = styled.div`
  margin-top: 24px;
  padding: 16px 20px;
  background: ${colors.background};
  border: 1px solid ${colors.divider};
  border-radius: 6px;
`;

const Header = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${colors.textPrimary};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MethodRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  &:not(:last-child) {
    border-bottom: 1px dashed ${colors.divider};
  }
`;

const MethodMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const MethodName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${colors.textPrimary};
`;

const MethodDates = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 2px;
`;

const StatusPill = styled.span<{ status: 'past' | 'present' | 'future' }>`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 10px;
  background: ${(p) =>
    p.status === 'present'
      ? colors.success
      : p.status === 'future'
      ? colors.coolGrey300
      : colors.grey400};
  color: white;
`;

const fmt = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '–';

interface Props {
  phaseId: string;
}

const CTA_LABEL: Partial<Record<ParticipationMethod, string>> = {
  ideation: 'Submit an idea',
  proposals: 'Submit a proposal',
  native_survey: 'Take the survey',
  survey: 'Open survey',
  community_monitor_survey: 'Take the survey',
  voting: 'Vote',
  poll: 'Answer the poll',
  volunteering: 'Volunteer',
  document_annotation: 'Annotate',
};

const ParallelMethods = ({ phaseId }: Props) => {
  const { data: methods } = usePhaseMethods(phaseId);
  const { data: phase } = usePhase(phaseId);
  const projectId = phase?.data.relationships.project.data.id;
  const { data: project } = useProjectById(projectId);

  if (!methods || methods.length < 2) {
    return null;
  }

  const handleCta = (method: IPhaseMethodData) => {
    if (!project) return;
    const slug = project.data.attributes.slug;
    const type = method.attributes.method_type;
    if (type === 'ideation' || type === 'proposals') {
      clHistory.push(
        `/projects/${slug}/ideas/new?phase_id=${phase?.data.id}&phase_method_id=${method.id}`
      );
    } else if (
      type === 'native_survey' ||
      type === 'community_monitor_survey'
    ) {
      clHistory.push(
        `/projects/${slug}/surveys/new?phase_id=${phase?.data.id}&phase_method_id=${method.id}`
      );
    } else if (type === 'poll') {
      clHistory.push(`/projects/${slug}/polls?phase_id=${phase?.data.id}`);
    } else if (type === 'voting') {
      clHistory.push(`/projects/${slug}/ideas?phase_id=${phase?.data.id}`);
    } else if (type === 'volunteering') {
      clHistory.push(`/projects/${slug}/volunteer?phase_id=${phase?.data.id}`);
    }
  };

  const sorted = [...methods].sort(
    (a: IPhaseMethodData, b: IPhaseMethodData) => {
      const av = a.attributes.start_at ?? '';
      const bv = b.attributes.start_at ?? '';
      return av < bv ? -1 : av > bv ? 1 : 0;
    }
  );

  return (
    <Wrapper className="e2e-parallel-methods">
      <Header>
        <Icon
          name="coin-stack"
          width="18px"
          height="18px"
          fill={colors.primary}
        />
        {methods.length} participation methods running in parallel
      </Header>
      <Box>
        {sorted.map((m) => {
          const status = pastPresentOrFuture([
            m.attributes.start_at ?? '',
            m.attributes.end_at,
          ]);
          return (
            <MethodRow
              key={m.id}
              className={`e2e-parallel-method e2e-parallel-method-${m.attributes.method_type}`}
            >
              <Icon
                name={METHOD_ICONS[m.attributes.method_type]}
                width="22px"
                height="22px"
                fill={colors.primary}
              />
              <MethodMeta>
                <MethodName>
                  {METHOD_LABELS[m.attributes.method_type]}
                </MethodName>
                <MethodDates>
                  {fmt(m.attributes.start_at)} – {fmt(m.attributes.end_at)}
                </MethodDates>
              </MethodMeta>
              <StatusPill status={status as 'past' | 'present' | 'future'}>
                {status === 'present'
                  ? 'Active now'
                  : status === 'future'
                  ? 'Upcoming'
                  : 'Ended'}
              </StatusPill>
              {status === 'present' && CTA_LABEL[m.attributes.method_type] && (
                <Button
                  className={`e2e-parallel-method-cta e2e-parallel-method-cta-${m.attributes.method_type}`}
                  buttonStyle="primary"
                  size="s"
                  ml="12px"
                  onClick={() => handleCta(m)}
                >
                  {CTA_LABEL[m.attributes.method_type]}
                </Button>
              )}
            </MethodRow>
          );
        })}
      </Box>
    </Wrapper>
  );
};

export default ParallelMethods;
