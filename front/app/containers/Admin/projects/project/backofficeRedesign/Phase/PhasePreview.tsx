import React from 'react';

import { useRouter } from '@tanstack/react-router';

import { IPhaseData, IUpdatedPhaseProperties } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PhonePreviewBackdrop from 'containers/Admin/projects/_shared/components/PhonePreviewBackdrop';

import PhasePreviewFrame from 'components/admin/PhasePreview';
import { usePhasePreviewDraft } from 'components/admin/PhasePreview/DraftContext';

import { useIntl } from 'utils/cl-intl';
import { createDraftPhase } from 'utils/phasePreview/draftPhase';

import messages from '../messages';

interface Props {
  projectId: string;
  phase?: IPhaseData;
  draft?: IUpdatedPhaseProperties;
}

const PhasePreview = ({ projectId, phase, draft }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const router = useRouter();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const edits = usePhasePreviewDraft(phase?.id);

  if (!project || !phases) return null;

  const previewPhase =
    phase ?? (draft ? createDraftPhase(projectId, draft) : undefined);
  const phaseIndex = phases.data.findIndex(({ id }) => id === phase?.id);
  const slug = project.data.attributes.slug;
  const src =
    phase?.attributes.placement_type === 'standalone'
      ? router.buildLocation({
          to: '/$locale/projects/$slug/surveys/new',
          params: { locale, slug },
          search: { phase_id: phase.id },
        }).href
      : router.buildLocation({
          to: '/$locale/projects/$slug/$phaseNumber',
          params: {
            locale,
            slug,
            phaseNumber: String(
              phaseIndex >= 0 ? phaseIndex + 1 : phases.data.length + 1
            ),
          },
        }).href;

  return (
    <PhonePreviewBackdrop>
      <PhasePreviewFrame
        key={phase?.id ?? 'new'}
        src={src}
        title={formatMessage(messages.phasePreviewTitle)}
        snapshot={{
          project: project.data,
          phase: previewPhase,
          draft: draft ?? edits,
          unsaved: !!draft,
        }}
      />
    </PhonePreviewBackdrop>
  );
};

export default PhasePreview;
