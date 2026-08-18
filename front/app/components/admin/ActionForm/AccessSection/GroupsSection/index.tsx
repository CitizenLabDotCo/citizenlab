import React, { useState } from 'react';

import {
  Box,
  Text,
  Button,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useGroups from 'api/groups/useGroups';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { getGroupIds } from '../../logic';
import actionFormMessages from '../../messages';
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

  // One-line summary shown while the row is collapsed.
  const groupCount = getGroupIds(permission).length;
  const summary =
    groupCount === 0
      ? formatMessage(messages.everyoneWhoSignsIn)
      : formatMessage(actionFormMessages.nGroups, { nGroups: groupCount });

  const setAccessDeniedMultiloc = (
    access_denied_explanation_multiloc: Multiloc
  ) => onChange({ access_denied_explanation_multiloc });

  return (
    <>
      <Expander
        icon="group"
        title={formatMessage(messages.limitToGroups)}
        summary={summary}
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
            fontSize={fontSizes.s}
            minHeight={36}
          />
        </Box>

        <Box mt="12px" display="flex">
          <Button
            buttonStyle="secondary-outlined"
            size="s"
            icon="edit"
            onClick={() => setErrorMessageOpen(true)}
            width="auto"
            fontSize={`${fontSizes.s}px`}
            iconSize={`${fontSizes.s}px`}
            padding="4px 8px"
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
    </>
  );
};

export default GroupsSection;
