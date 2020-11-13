import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from './messages';

type Props = {
  children: React.ReactNode;
};

const ProjectDashboard = ({ children }: Props) => {
  return (
    <>
      <HelmetIntl
        title={messages.helmetTitle}
        description={messages.helmetDescription}
      />
      {children}
    </>
  );
};

export default ProjectDashboard;
