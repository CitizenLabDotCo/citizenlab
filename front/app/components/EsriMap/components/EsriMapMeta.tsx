import React from 'react';

import { Helmet } from 'react-helmet-async';

const EsriMapMeta = () => {
  // For clients using an Esri API Key to access private data,
  // we need to make sure we're sending the platform URL as the referrer
  // in these requests.

  // In our nginx configuration, we're setting the referrer policy to 'no-referrer'
  // by default, so we need to override it here so Esri network requests work properly.
  return (
    <Helmet>
      <meta name="referrer" content="origin" />
    </Helmet>
  );
};

export default EsriMapMeta;
