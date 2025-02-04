import React from 'react';

import { Helmet } from 'react-helmet-async';

const EsriMapMeta = () => {
  return (
    <Helmet>
      <meta name="referrer" content="origin" />
    </Helmet>
  );
};

export default EsriMapMeta;
