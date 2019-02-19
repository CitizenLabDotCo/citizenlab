import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IProject } from 'services/projects';

// components
import HasPermission from 'components/HasPermission';
import OfficialFeedbackNew from './Form/New';
import Feed from './Feed';

interface Props {
  ideaId: string;
  project: IProject | null;
}

const OfficialFeedback = ({ ideaId, project }: Props) => {
  return (
    <>
      {!isNilOrError(project) &&
        <HasPermission item={project.data} action="moderate">
          <OfficialFeedbackNew ideaId={ideaId}/>
        </HasPermission>
      }

      <Feed
        ideaId={ideaId}
      />
    </>
  );
};

export default OfficialFeedback;
