import React from 'react';
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from './messages';

type Props = {
  children: React.ReactNode;
};

const ProjectDashboard = ({ children }: Props) => (
  <>
    <HelmetIntl
      title={messages.helmetTitle}
      description={messages.helmetDescription}
    />
    {children}
  </>
);

export default ProjectDashboard;
