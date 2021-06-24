import React, { memo } from 'react';

// components
import TopBar from './TopBar';

// svg
import noEventsIllustration from './NoEventsPicture.svg';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const PlaceHolder = styled.div`
  background-color: green;
  width: 100%;
  height: 237px;
  margin-top: 33px;
`;

const NoEventsContainer = styled.figure`
  position: relative;
  width: 100%;
  margin: 78px 0px 125px 0px;
`;

const NoEventsIllustration = styled.img`
  width: 345px;
  height: 286px;
  display: block;
  margin: 0px auto;
`;

const NoEventsText = styled.figcaption`
  margin: 37px auto 0px auto;
  text-align: center;
  color: ${colors.label};
  font-size: ${fontSizes.xl}px;
`;

interface Props {
  title: string;
  events: number[];
}

const EventViewer = memo<Props>(({ title, events }) => {
  return (
    <>
      <TopBar title={title} />

      {events.length > 0 &&
        events.map((e) => <PlaceHolder key={e}>{e}</PlaceHolder>)}

      {events.length === 0 && (
        <NoEventsContainer>
          <NoEventsIllustration src={noEventsIllustration} />

          <NoEventsText>There are no upcoming events</NoEventsText>
        </NoEventsContainer>
      )}
    </>
  );
});

export default EventViewer;
