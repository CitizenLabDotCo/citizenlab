import React, { useState } from 'react';

import { Box, Spinner, colors } from '@citizenlab/cl2-component-library';

type Props = {
  microsoftFormsUrl: string;
  className?: string;
};

const MicrosoftFormsSurvey = ({ microsoftFormsUrl, className }: Props) => {
  const [loading, setLoading] = useState(true);

  const onLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <Box display="flex" justifyContent="center" className={className}>
      <Box
        as="iframe"
        border={`1px solid ${colors.grey400}`}
        display={loading ? 'none' : 'block'}
        h="600px"
        w="100%"
        src={microsoftFormsUrl}
        onLoad={onLoad}
      />
      {loading && <Spinner />}
    </Box>
  );
};

export default MicrosoftFormsSurvey;
