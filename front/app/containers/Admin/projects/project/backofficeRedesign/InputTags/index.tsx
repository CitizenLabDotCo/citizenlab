import React, { useState } from 'react';

import {
  Box,
  Button,
  Spinner,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import { IPhaseData, InputTerm } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import ErrorMessage from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import inputTermMessages from '../InputManager/inputTermMessages';

import messages from './messages';
import PerspectivesSection from './PerspectivesSection';
import TagsEditor from './TagsEditor';
import useTagsDraft from './TagsEditor/useTagsDraft';

interface Props {
  project: IProjectData;
  phase?: IPhaseData;
  inputTerm: InputTerm;
}
const InputTags = ({ project, phase, inputTerm }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const draft = useTagsDraft(project.id);
  const { data: phases } = usePhases(project.id, 'all');
  const perspectivesActive = useFeatureFlag({ name: 'live_auto_input_topics' });
  const { mutateAsync: updateProject } = useUpdateProject();
  const [perspectives, setPerspectives] = useState(
    project.attributes.live_auto_input_topics_enabled
  );
  const [failed, setFailed] = useState(false);
  const others =
    phases?.data.filter(
      (other) =>
        other.id !== phase?.id &&
        ['ideation', 'voting', 'proposals'].includes(
          other.attributes.participation_method
        )
    ) ?? [];
  const save = async () => {
    setFailed(false);
    try {
      if (perspectives !== project.attributes.live_auto_input_topics_enabled) {
        await updateProject({
          projectId: project.id,
          live_auto_input_topics_enabled: perspectives,
        });
      }
      if (!(await draft.save())) throw new Error('Tags save failed');
    } catch (error) {
      setFailed(true);
      throw error;
    }
  };
  useRegisterPageSaver('input-tags', {
    dirty:
      draft.dirty ||
      perspectives !== project.attributes.live_auto_input_topics_enabled,
    save,
  });
  return (
    <Box p="18px" display="flex" flexDirection="column" gap="16px">
      <Button
        buttonStyle="bo-text"
        icon="arrow-left"
        onClick={() => removeSearchParams(['input_tags'])}
      >
        {formatMessage(messages.back)}
      </Button>
      <Text variant="boSection" m="0">
        {formatMessage(messages.tagsTitle, {
          term: formatMessage(inputTermMessages.capitalizedSingular, {
            term: inputTerm,
          }),
        })}
      </Text>
      {others.length > 0 && (
        <Box background={colors.grey100} p="12px" role="note">
          <Text variant="boHelper" m="0">
            {formatMessage(messages.sharedTags, {
              methods: others
                .map((other) => localize(other.attributes.title_multiloc))
                .join(', '),
              count: others.length,
            })}
          </Text>
        </Box>
      )}
      {perspectivesActive && (
        <PerspectivesSection
          enabled={perspectives}
          onChange={setPerspectives}
        />
      )}
      {failed && <ErrorMessage text={formatMessage(messages.saveFailed)} />}
      {draft.tags ? <TagsEditor draft={draft} /> : <Spinner />}
    </Box>
  );
};
export default InputTags;
