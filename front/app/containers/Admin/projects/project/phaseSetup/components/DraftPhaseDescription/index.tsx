import React, { useState } from 'react';

import {
  Box,
  Text,
  Button,
  IconTooltip,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { IUpdatedPhaseProperties } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phaseId: string | undefined;
  descriptionMultiloc: Multiloc | undefined;
  draftDescriptionMultiloc: Multiloc | undefined;
  onChange: (data: Partial<IUpdatedPhaseProperties>) => void;
}

const DraftPhaseDescription = ({
  phaseId,
  descriptionMultiloc,
  draftDescriptionMultiloc,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updatePhase } = useUpdatePhase();

  const handleClickToEdit = () => {
    const hasDraft =
      draftDescriptionMultiloc &&
      Object.keys(draftDescriptionMultiloc).length > 0;
    if (!hasDraft) {
      onChange({ draft_description_multiloc: descriptionMultiloc || {} });
    }
    setIsEditing(true);
  };

  const handleDraftChange = (draft_description_multiloc: Multiloc) => {
    onChange({ draft_description_multiloc });
  };

  const handlePublish = () => {
    if (!phaseId) return;
    updatePhase(
      {
        phaseId,
        description_multiloc: draftDescriptionMultiloc,
        draft_description_multiloc: draftDescriptionMultiloc,
      },
      {
        onSuccess: () => {
          onChange({
            description_multiloc: draftDescriptionMultiloc,
            draft_description_multiloc: draftDescriptionMultiloc,
          });
          setIsEditing(false);
        },
      }
    );
  };

  const handleDiscard = () => {
    if (!phaseId) return;
    updatePhase(
      {
        phaseId,
        draft_description_multiloc: descriptionMultiloc,
      },
      {
        onSuccess: () => {
          onChange({ draft_description_multiloc: descriptionMultiloc });
          setIsEditing(false);
        },
      }
    );
  };

  if (isEditing) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap="8px" mb="12px">
          <Text fontWeight="bold" fontSize="base" m="0px">
            {formatMessage(messages.draftDescriptionStateLabel, {
              state: formatMessage(messages.draftDescriptionDraftState),
            })}
          </Text>
          <IconTooltip
            content={formatMessage(messages.draftDescriptionDraftTooltip)}
          />
          <StatusLabel
            text={formatMessage(messages.draftDescriptionDraftBadge)}
            backgroundColor={colors.orange500}
          />
        </Box>
        <QuillMultilocWithLocaleSwitcher
          id="draft-description"
          valueMultiloc={draftDescriptionMultiloc}
          onChange={handleDraftChange}
          withCTAButton
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt="8px"
        >
          <Button buttonStyle="text" onClick={handleDiscard} padding="0px">
            {formatMessage(messages.draftDescriptionDiscardChanges)}
          </Button>
          <Button buttonStyle="admin-dark" onClick={handlePublish}>
            {formatMessage(messages.draftDescriptionPublish)}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap="8px" mb="12px">
        <Text fontWeight="bold" fontSize="base" m="0px">
          {formatMessage(messages.draftDescriptionStateLabel, {
            state: formatMessage(messages.draftDescriptionPublishedState),
          })}
        </Text>
        <IconTooltip
          content={formatMessage(messages.draftDescriptionPublishedTooltip)}
        />
        <StatusLabel
          text={formatMessage(messages.draftDescriptionPublishedBadge)}
          backgroundColor={colors.green500}
        />
      </Box>
      <QuillMultilocWithLocaleSwitcher
        id="published-description"
        valueMultiloc={descriptionMultiloc}
        onChange={() => {}}
        readOnly
        withCTAButton
      />
      <Box display="flex" justifyContent="flex-end" mt="4px">
        <Button buttonStyle="text" onClick={handleClickToEdit} padding="0px">
          {formatMessage(messages.draftDescriptionClickToEdit)}
        </Button>
      </Box>
    </Box>
  );
};

export default DraftPhaseDescription;
