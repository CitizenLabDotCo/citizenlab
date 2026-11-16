import React from 'react';

import { router } from 'routes';

import { ParticipationMethod } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import SettingsModal from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal';
import ParticipationMethodChoices from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/ParticipationMethodChoices';
import projectPageMessages from 'containers/Admin/projects/project/projectPage/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import { useSearch } from 'utils/router';

import messages from './messages';
import styles from './SelectMethodModal.module.css';

const METHOD_GROUPS: {
  name: string;
  label: MessageDescriptor;
  methods: ParticipationMethod[];
}[] = [
  {
    name: 'gather',
    label: messages.methodGroupGatherInput,
    methods: ['ideation', 'proposals', 'native_survey', 'document_annotation'],
  },
  {
    name: 'decide',
    label: messages.methodGroupShapeDecisions,
    methods: ['proposals', 'common_ground', 'voting', 'document_annotation'],
  },
  {
    name: 'inform',
    label: messages.methodGroupInformAndRecruit,
    methods: ['information', 'volunteering'],
  },
];

interface Props {
  projectId: string;
  opened: boolean;
  onClose: () => void;
}

// Picking a method opens the build view of a phase that isn't saved yet: the
// phase is created there once it has a title and dates.
const SelectMethodModal = ({ projectId, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const { participation_method } = useSearch({ strict: false });

  return (
    <SettingsModal
      opened={opened}
      close={onClose}
      size={920}
      header={formatMessage(projectPageMessages.newParticipationMethod)}
      sections={METHOD_GROUPS.map(({ name, label, methods }) => ({
        name,
        label,
        content: (
          <div className={styles.methods}>
            <ParticipationMethodChoices
              variant="panel"
              methods={methods}
              onSelect={(_event, method) =>
                method === participation_method
                  ? onClose()
                  : // Through the router, so unsaved changes block it.
                    router.navigate({
                      to: '/$locale/admin/projects/$projectId/phases/new',
                      params: { locale, projectId },
                      search: ({ project_backoffice_redesign }) => ({
                        project_backoffice_redesign,
                        participation_method: method,
                      }),
                    })
              }
            />
          </div>
        ),
      }))}
    />
  );
};

export default SelectMethodModal;
