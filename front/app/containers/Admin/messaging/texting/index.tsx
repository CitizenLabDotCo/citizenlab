import React, { useState } from 'react';

import New from './CreateNewMessage';
import Display from './DisplaySentMessage';
import Preview from './PreviewMessage';

const TextingCampaigns = () => {
  const [pageDisplay, setPageDisplay] = useState('new');
  const [hideToggle, setHideToggle] = useState(false);

  return (
    <>
      {hideToggle === false && (
        <>
          {' '}
          <button
            onClick={() => {
              setPageDisplay('new');
            }}
          >
            new{' '}
          </button>
          <button
            onClick={() => {
              setPageDisplay('show');
            }}
          >
            show{' '}
          </button>
          <button
            onClick={() => {
              setPageDisplay('preview');
            }}
          >
            preview{' '}
          </button>
          <button
            onClick={() => {
              setHideToggle(true);
            }}
          >
            hide toggle
          </button>
        </>
      )}

      {pageDisplay === 'show' && <Display />}
      {pageDisplay === 'new' && <New />}
      {pageDisplay === 'preview' && <Preview />}
    </>
  );
};

export default TextingCampaigns;
