import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import FormActions from 'containers/Admin/formBuilder/components/FormActions';

// i18n
import messages from './messages';

// hooks
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// Utils
import { isNilOrError } from 'utils/helperUtils';

// Services
import { IPhaseData, updatePhase } from 'services/phases';
import { IProjectData, updateProject } from 'services/projects';

// Typings
import { Multiloc } from 'typings';

type FormActionsConfig = {
  editFormLink: string;
  heading?: Multiloc;
  postingEnabled: boolean;
  toggleSubmissionsEnabled: () => void;
};

const getSurveyPhases = (phases: IPhaseData[] | Error | null | undefined) => {
  return !isNilOrError(phases)
    ? phases.filter(
        (phase) => phase.attributes.participation_method === 'native_survey'
      )
    : [];
};

const getFormActionsConfig = (
  project: IProjectData,
  phases?: IPhaseData[] | Error | null | undefined
): FormActionsConfig[] => {
  const processType = project.attributes.process_type;
  if (processType === 'continuous') {
    return [
      {
        editFormLink: `/admin/projects/${project.id}/native-survey/edit`,
        postingEnabled: project?.attributes.posting_enabled,
        toggleSubmissionsEnabled: () => {
          updateProject(project.id, {
            posting_enabled: !project.attributes.posting_enabled,
          });
        },
      },
    ];
  }

  return getSurveyPhases(phases).map((phase) => ({
    editFormLink: `/admin/projects/${project.id}/phases/${phase.id}/native-survey/edit`,
    heading: phase.attributes.title_multiloc,
    postingEnabled: phase.attributes.posting_enabled,
    toggleSubmissionsEnabled: () => {
      updatePhase(phase.id, {
        posting_enabled: !phase.attributes.posting_enabled,
      });
    },
  }));
};

const Forms = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });
  const phases = usePhases(projectId);

  if (isNilOrError(project)) {
    return null;
  }

  const formActionsConfigs = getFormActionsConfig(project, phases);

  return (
    <>
      <Box width="100%">
        <Box width="100%">
          <Title>{formatMessage(messages.survey)}</Title>
          <Text>{formatMessage(messages.surveyDescription)}</Text>
        </Box>
        {formActionsConfigs.map(
          (
            { editFormLink, heading, postingEnabled, toggleSubmissionsEnabled },
            index
          ) => {
            return (
              <>
                <FormActions
                  editFormLink={editFormLink}
                  viewFormLink={`/projects/${project?.attributes.slug}/ideas/new`}
                  heading={heading}
                  postingEnabled={postingEnabled}
                  toggleSubmissionsEnabled={toggleSubmissionsEnabled}
                />
                {index !== formActionsConfigs.length - 1 && (
                  <Box height="1px" border="1px solid #E0E0E0" />
                )}
              </>
            );
          }
        )}
      </Box>
    </>
  );
};

export default injectIntl(Forms);
