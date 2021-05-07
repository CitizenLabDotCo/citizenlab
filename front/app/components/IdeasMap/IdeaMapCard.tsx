import React, { memo, useEffect, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// events
import { setIdeaMapCardSelected } from './events';
import {
  setLeafletMapCenter,
  setLeafletMapHoveredMarker,
  leafletMapHoveredMarker$,
} from 'components/UI/LeafletMap/events';

// hooks
import useIdea from 'hooks/useIdea';

// i18n
import T from 'components/T';

// styling
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

const Container = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  ${defaultCardStyle};
  border: solid 1px #ccc;
  cursor: pointer;

  &.hovered {
    border-color: #000;
  }
`;

interface Props {
  ideaId: string;
  className?: string;
}

const IdeaMapCard = memo<Props>(({ ideaId, className }) => {
  const idea = useIdea({ ideaId });

  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const subscriptions = [
      leafletMapHoveredMarker$.subscribe((hoverredIdeaId) => {
        setHovered(hoverredIdeaId === ideaId);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  const handleOnClick = (event: React.FormEvent) => {
    event?.preventDefault();

    setIdeaMapCardSelected(ideaId);

    if (!isNilOrError(idea)) {
      const lng = idea.attributes.location_point_geojson.coordinates[0];
      const lat = idea.attributes.location_point_geojson.coordinates[1];
      setLeafletMapCenter([lat, lng]);
    }
  };

  const handleOnMouseEnter = () => {
    // setHovered(true);
    setLeafletMapHoveredMarker(ideaId);
  };

  const handleOnMouseLeave = () => {
    // setHovered(false);
    setLeafletMapHoveredMarker(null);
  };

  if (!isNilOrError(idea)) {
    return (
      <Container
        className={`${className || ''} ${hovered ? 'hovered' : ''}`}
        onClick={handleOnClick}
        onMouseEnter={handleOnMouseEnter}
        onMouseLeave={handleOnMouseLeave}
      >
        <T value={idea.attributes.title_multiloc} />
        <div>Upvotes: {idea.attributes.upvotes_count}</div>
        <div>Location: {idea.attributes.location_description}</div>
      </Container>
    );
  }

  return null;
});

export default IdeaMapCard;
