import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useCanEditProjectContext } from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/utils';

import OptionPicker, { PickerOption } from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';

import {
  FIND_OPTIONS,
  Listed,
  OPEN_OPTIONS,
  VisibilityOption,
} from '../../_shared/visibilityOptions';
import messages from '../../messages';
import PanelHeading from '../PanelHeading';

import ContextDropdowns from './ContextDropdowns';

interface Props {
  project: IProjectData;
}

const SetupDropdowns = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject } = useUpdateProject();
  const canEditProjectContext = useCanEditProjectContext();

  const { listed, visible_to } = project.attributes;

  const formatOption = <T extends string>({
    value,
    icon,
    label,
    description,
  }: VisibilityOption<T>): PickerOption<T> => ({
    value,
    icon,
    label: formatMessage(label),
    description: formatMessage(description),
  });

  return (
    <Box>
      {canEditProjectContext && <ContextDropdowns project={project} />}

      <PanelHeading title={formatMessage(messages.visibility)} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="8px"
      >
        <OptionPicker<Listed>
          title={formatMessage(messages.publishWhoCanFind)}
          description={formatMessage(messages.publishWhoCanFindDescription)}
          options={FIND_OPTIONS.map(formatOption)}
          value={listed ? 'listed' : 'unlisted'}
          onChange={(value) =>
            updateProject({ projectId: project.id, listed: value === 'listed' })
          }
        />

        <OptionPicker
          title={formatMessage(messages.publishWhoCanOpen)}
          description={formatMessage(messages.publishWhoCanOpenDescription)}
          options={OPEN_OPTIONS.map(formatOption)}
          value={visible_to}
          onChange={(value) =>
            updateProject({ projectId: project.id, visible_to: value })
          }
        />
      </Box>
    </Box>
  );
};

export default SetupDropdowns;
