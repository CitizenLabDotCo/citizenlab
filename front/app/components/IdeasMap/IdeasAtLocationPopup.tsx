import React from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Button } from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';

import { IIdeaData } from 'api/ideas/types';

import useLocalize from 'hooks/useLocalize';

import { Spacer } from 'components/UI/FormComponents';

type Props = {
  portalElement: HTMLDivElement;
  ideas: IIdeaData[];
  setSelectedIdea: (ideaId: string) => void;
  mapView: MapView | null;
};

const IdeasAtLocationPopup = ({
  setSelectedIdea,
  portalElement,
  ideas,
  mapView,
}: Props) => {
  const localize = useLocalize();

  if (!portalElement) return null;

  // A portal is needed here as we're inserting our React component into the Esri Map popup as its content
  return createPortal(
    <Box maxHeight="100px">
      {ideas.map((idea) => (
        <Button
          key={idea.id}
          width="100%"
          mb="12px"
          onClick={() => {
            setSelectedIdea(idea.id);
            mapView?.closePopup();
          }}
        >
          {localize(idea.attributes.title_multiloc)}
        </Button>
      ))}
      <Spacer />
    </Box>,
    portalElement
  );
};

export default IdeasAtLocationPopup;
