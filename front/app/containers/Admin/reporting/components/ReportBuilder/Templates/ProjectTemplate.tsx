import React from 'react';

// hooks
// import useProject from

// components
import AboutReportWidget from '../Widgets/AboutReportWidget';

interface Props {
  reportId: string;
  // projectId: string;
}

const ProjectTemplate = ({ reportId }: Props) => {
  return <AboutReportWidget reportId={reportId} />;
};

export default ProjectTemplate;
