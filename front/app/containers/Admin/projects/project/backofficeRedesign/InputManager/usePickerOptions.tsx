import React from 'react';

import useIdeaStatuses from 'api/idea_statuses/useIdeaStatuses';
import useInputTopics from 'api/input_topics/useInputTopics';
import usePhases from 'api/phases/usePhases';
import { canContainIdeas } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import { ManagerType } from 'components/admin/PostManager';
import postManagerMessages from 'components/admin/PostManager/messages';

import { FormattedMessage } from 'utils/cl-intl';

import { Option } from './OptionList';

const usePickerOptions = (type: ManagerType, projectId: string) => {
  const localize = useLocalize();
  const { data: statuses } = useIdeaStatuses({
    queryParams: {
      participation_method:
        type === 'ProjectProposals' ? 'proposals' : 'ideation',
    },
  });
  const { data: topics } = useInputTopics(projectId);
  const { data: phases } = usePhases(projectId);

  const statusOptions: Option[] = (statuses?.data ?? []).map((status) => ({
    value: status.id,
    label: localize(status.attributes.title_multiloc),
    color: status.attributes.color,
    disabled: !status.attributes.can_manually_transition_to,
    disabledReason: (
      <FormattedMessage {...postManagerMessages.automatedStatusTooltipText} />
    ),
  }));

  const tagOptions: Option[] = (topics?.data ?? []).map((topic) => ({
    value: topic.id,
    label: localize(topic.attributes.full_title_multiloc),
  }));

  const phaseOptions: Option[] = (phases?.data ?? [])
    .filter(canContainIdeas)
    .map((phase) => ({
      value: phase.id,
      label: localize(phase.attributes.title_multiloc),
    }));

  return {
    statuses: statuses?.data ?? [],
    statusOptions,
    tagOptions,
    phaseOptions,
  };
};

export default usePickerOptions;
