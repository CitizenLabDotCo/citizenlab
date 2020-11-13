import React from 'react';
import HelmetIntl from 'components/HelmetIntl';

import clHistory from 'utils/cl-router/history';
import { isNilOrError } from 'utils/helperUtils';

// resources
import useAuthUser from 'hooks/useAuthUser';
import { isAdmin, isModerator } from 'services/permissions/roles';

// i18n
import messages from './messages';

type Props = {
  children: React.ReactNode;
};

const ProjectDashboard = ({ children }: Props) => {
  const authUser = useAuthUser();
  if (isNilOrError(authUser) || !isAdmin(authUser) || !isModerator(authUser)) {
    clHistory.push('/');
    return null;
  }
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
