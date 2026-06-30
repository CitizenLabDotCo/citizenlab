import React, { useState } from 'react';

import { Box, Text, Button, colors } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useGroups from 'api/groups/useGroups';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { getGroupIds, groupsSummary } from '../../logic';
import { Changes } from '../../types';
import { Expander } from '../../ui';

import ErrorMessageModal from './ErrorMessageModal';
import messages from './messages';

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const GroupsSection = ({ permission, onChange }: Props) => {
  const localize = useLocalize();
  const { data: groups } = useGroups({});
  const [errorMessageOpen, setErrorMessageOpen] = useState(false);
  const { formatMessage } = useIntl();

  const setAccessDeniedMultiloc = (
    access_denied_explanation_multiloc: Multiloc
  ) => onChange({ access_denied_explanation_multiloc });

  return (
    <Box mt="8px" borderTop={`1px solid ${colors.divider}`}>
      <Expander
        icon="group"
        title="Limit to groups"
        summary={groupsSummary(permission, formatMessage)}
      >
        <Text as="p" mt="0" mb="8px" fontSize="xs" color="coolGrey600">
          <FormattedMessage {...messages.participantMustBe} />
        </Text>
        <Box maxWidth="440px">
          <MultipleSelect
            value={getGroupIds(permission)}
            options={(groups?.data ?? []).map((g) => ({
              value: g.id,
              label: localize(g.attributes.title_multiloc),
            }))}
            onChange={(options) =>
              onChange({ group_ids: options.map((o) => o.value) })
            }
            placeholder={<FormattedMessage {...messages.allParticipants} />}
          />
        </Box>

        <Box mt="12px">
          <Button
            buttonStyle="secondary-outlined"
            size="s"
            icon="edit"
            onClick={() => setErrorMessageOpen(true)}
          >
            <FormattedMessage {...messages.customizeErrorMessage} />
          </Button>
        </Box>
      </Expander>

      <ErrorMessageModal
        opened={errorMessageOpen}
        valueMultiloc={permission.attributes.access_denied_explanation_multiloc}
        onClose={() => setErrorMessageOpen(false)}
        onChange={setAccessDeniedMultiloc}
      />
    </Box>
  );
};

export default GroupsSection;
