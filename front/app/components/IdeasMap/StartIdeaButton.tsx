import React from 'react';

import { createPortal } from 'react-dom';

import usePhases from 'api/phases/usePhases';

import IdeaButton from 'components/IdeaButton';

type Props = {
  modalPortalElement: HTMLDivElement;
  latlng: GeoJSON.Point | null;
  projectId: string;
  phaseId: string;
};

const StartIdeaButton = ({
  modalPortalElement,
  projectId,
  phaseId,
  latlng,
}: Props) => {
  const { data: phases } = usePhases(projectId);
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const phase = phases?.data?.find((phase) => phase.id === phaseId);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!modalPortalElement) return null;

  // A portal is needed here as we're inserting our React component into the Esri Map popup as its content
  return createPortal(
    <IdeaButton
      id="e2e-idea-from-map-button"
      latLng={latlng}
      projectId={projectId}
      phase={phase}
      participationMethod={'ideation'}
    />,
    modalPortalElement
  );
};

export default StartIdeaButton;
