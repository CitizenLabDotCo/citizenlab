import React from 'react';

import useProjectsMini from 'api/projects_mini/useProjectsMini';

const Projects = () => {
  const { data } = useProjectsMini({
    endpoint: 'for_admin',
    sort: 'phase_starting_or_ending_soon',
  });

  console.log(data);

  return <>Projects!</>;
};

export default Projects;
