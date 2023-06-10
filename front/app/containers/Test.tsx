import React, { useEffect } from 'react';
import { Box, Button } from '@citizenlab/cl2-component-library';
import useABTest from 'api/experiments/useABTest';
// import useExperiments from 'api/experiments/useExperiments';

const Test = () => {
  // Uncomment this to see the experiment data stored in the BE
  // const { data: experiments } = useExperiments();
  // console.log(experiments);

  const { treatment, send } = useABTest({
    experiment: 'Button location',
    treatments: ['left', 'right'],
  });

  useEffect(() => {
    if (!send) return;
    send('Page entered');
  }, [send]);

  if (!treatment || !send) return null;

  const handleClick = () => send('Button clicked');

  return (
    <Box h="300px" p="52px" display="flex" justifyContent="space-between">
      <Box>
        {treatment === 'left' && (
          <Button text="Left button" onClick={handleClick} />
        )}
      </Box>
      <Box>
        {treatment === 'right' && (
          <Button text="Right button" onClick={handleClick} />
        )}
      </Box>
    </Box>
  );
};

export default Test;
