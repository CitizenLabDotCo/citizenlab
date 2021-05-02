import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// events
import { setSelectedIdeaId } from './events';

// components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaPreview from './IdeaPreview';
import IdeaButton from 'components/IdeaButton';

// hooks
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useIdea from 'hooks/useIdea';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';
import T from 'components/T';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import { fontSizes, colors, defaultCardStyle } from 'utils/styleUtils';

const Container = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  ${defaultCardStyle};
  border: solid 1px #ccc;
`;

interface Props {
  ideaId: string;
  className?: string;
}

const IdeaMapCard = memo<Props>(({ ideaId, className }) => {
  const idea = useIdea({ ideaId });

  const handleOnClick = (event: React.FormEvent) => {
    event?.preventDefault();
    setSelectedIdeaId(ideaId);
  };

  if (!isNilOrError(idea)) {
    return (
      <Container className={className || ''} onClick={handleOnClick}>
        <T value={idea.attributes.title_multiloc} />
        <div>Upvotes: {idea.attributes.upvotes_count}</div>
        <div>Location: {idea.attributes.location_description}</div>
      </Container>
    );
  }

  return null;
});

export default IdeaMapCard;
