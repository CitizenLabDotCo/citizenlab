import React from 'react';

const Loading = (props) => {
  if (props.pastDelay) {
    return <div>Loading...</div>;
  } else {
    return null;
  }
};

export default Loading;
