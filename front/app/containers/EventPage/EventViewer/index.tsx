import React, { memo } from 'react';

// components
import TopBar from './TopBar';

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
}

const EventViewer = memo<Props>(({ title }) => {
  const dummyEvents = Array(10)
    .fill(0)
    .map((_, i) => i + 1);

  return (
    <>
      <TopBar title={title} />

      {dummyEvents.map((e) => (
        <PlaceHolder>{e}</PlaceHolder>
      ))}
    </>
  );
});

export default EventViewer;
