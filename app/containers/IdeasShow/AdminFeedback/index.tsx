import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IProject } from 'services/projects';

// components
import HasPermission from 'components/HasPermission';
import AdminFeedbackNew from './Form/New';
import Feed from './Feed';

interface Props {
  ideaId: string;
  project: IProject | null;
}

const AdminFeedback = ({ ideaId, project }: Props) => {
  return (
    <>
      {!isNilOrError(project) &&
        <HasPermission item={project.data} action="moderate">
          <AdminFeedbackNew ideaId={ideaId}/>
        </HasPermission>
      }

      <Feed
        ideaId={ideaId}
      />
    </>
  );
};

export default AdminFeedback;
