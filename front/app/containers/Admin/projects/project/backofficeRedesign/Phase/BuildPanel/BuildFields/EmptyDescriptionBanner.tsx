import React from 'react';

import { Multiloc } from 'typings';

import Banner from 'design-system/Banner';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import useFeatureFlag from 'hooks/useFeatureFlag';

import descriptionMessages from 'containers/Admin/projects/project/phaseDescription/messages';

import { useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';

interface Props {
  projectId: string;
  phaseId?: string;
  value: Multiloc | undefined;
}

const EmptyDescriptionBanner = ({ projectId, phaseId, value }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(phaseId);
  const draftDescriptionEnabled = useFeatureFlag({
    name: 'draft_phase_description',
  });

  // A draft description only counts once it is published.
  const description =
    draftDescriptionEnabled && phaseId
      ? phase?.data.attributes.description_multiloc
      : value;

  if (!phases || phases.data.length >= 2) return null;
  if (draftDescriptionEnabled && phaseId && !phase) return null;
  if (description && !isEmptyMultiloc(description)) return null;

  return (
    <Banner tone="info">
      {formatMessage(descriptionMessages.emptyDescriptionWarning)}
    </Banner>
  );
};

export default EmptyDescriptionBanner;
