import React, { useState } from 'react';

import { IPhaseData, InputTerm } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';

import Banner from 'design-system/Banner';
import Button from 'design-system/Button';
import Spinner from 'design-system/Spinner';
import 'design-system/tokens.css';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import inputTermMessages from '../InputManager/inputTermMessages';

import styles from './InputTags.module.css';
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
    <div className={styles.inputTags}>
      <div className={styles.back}>
        <Button
          variant="quiet"
          size={32}
          icon="arrow-left-16"
          onPress={() => removeSearchParams(['input_tags'])}
        >
          {formatMessage(messages.back)}
        </Button>
      </div>
      <h2 className={styles.title}>
        {formatMessage(messages.tagsTitle, {
          term: formatMessage(inputTermMessages.capitalizedSingular, {
            term: inputTerm,
          }),
        })}
      </h2>
      {others.length > 0 && (
        <div role="note">
          <Banner tone="neutral">
            {formatMessage(messages.sharedTags, {
              methods: others
                .map((other) => localize(other.attributes.title_multiloc))
                .join(', '),
              count: others.length,
            })}
          </Banner>
        </div>
      )}
      {perspectivesActive && (
        <PerspectivesSection
          enabled={perspectives}
          onChange={setPerspectives}
        />
      )}
      {failed && (
        // The workspace scrolls to this class after a failed save.
        <div className="e2e-error-message">
          <Banner tone="error">{formatMessage(messages.saveFailed)}</Banner>
        </div>
      )}
      {draft.tags ? <TagsEditor draft={draft} /> : <Spinner />}
    </div>
  );
};
export default InputTags;
