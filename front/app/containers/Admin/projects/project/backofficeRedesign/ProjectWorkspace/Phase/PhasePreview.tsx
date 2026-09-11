import React from 'react';

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import PhonePreview from 'containers/Admin/projects/_shared/components/PhonePreview';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  projectId: string;
  phase: IPhaseData;
}

const PhasePreview = ({ projectId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  if (!project || !phases) return null;

  // The resident page addresses phases by their position in the timeline, not
  // by id. A detached phase has no position, so it falls back to the project.
  const phaseIndex = phases.data.findIndex(({ id }) => id === phase.id);
  const slug = project.data.attributes.slug;
  const path =
    phaseIndex === -1
      ? `/${locale}/projects/${slug}`
      : `/${locale}/projects/${slug}/${phaseIndex + 1}`;

  return (
    <PhonePreview
      src={`${path}${window.location.search}`}
      title={formatMessage(messages.phasePreviewTitle)}
    />
  );
};

export default PhasePreview;
