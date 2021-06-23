import React, { memo } from 'react';

// components
import TopBar from './TopBar';
import NoEventsPicture from './NoEventsPicture.svg';

// styling
import styled from 'styled-components';

const PlaceHolder = styled.div`
  background-color: green;
  width: 100%;
  height: 237px;
  margin-top: 33px;
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

      {events.length === 0 && <NoEventsPicture />}
    </>
  );
});

export default EventViewer;
