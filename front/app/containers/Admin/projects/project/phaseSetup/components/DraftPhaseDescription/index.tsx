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

import useUpdatePhase from 'api/phases/useUpdatePhase';

import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  phaseId: string;
  descriptionMultiloc: Multiloc;
  draftDescriptionMultiloc: Multiloc | undefined;
}

const DraftPhaseDescription = ({
  phaseId,
  descriptionMultiloc,
  draftDescriptionMultiloc: initialDraft,
}: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updatePhase, isLoading } = useUpdatePhase();
  const [loadingAction, setLoadingAction] = useState<
    'publish' | 'saveDraft' | 'discard' | null
  >(null);

  const hasSavedDraft = initialDraft && Object.keys(initialDraft).length > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [localDraft, setLocalDraft] = useState<Multiloc>(
    hasSavedDraft ? initialDraft : descriptionMultiloc
  );

  const handleClickToEdit = () => {
    if (!hasSavedDraft) {
      setLocalDraft(descriptionMultiloc);
    }
    setIsEditing(true);
  };

  const handleDraftChange = (value: Multiloc) => {
    setLocalDraft(value);
  };

  const handlePublish = () => {
    setLoadingAction('publish');
    updatePhase(
      {
        phaseId,
        description_multiloc: localDraft,
        draft_description_multiloc: {},
      },
      {
        onSuccess: () => {
          setLoadingAction(null);
          setIsEditing(false);
        },
        onError: () => setLoadingAction(null),
      }
    );
  };

  const handleSaveDraft = () => {
    setLoadingAction('saveDraft');
    updatePhase(
      {
        phaseId,
        draft_description_multiloc: localDraft,
      },
      {
        onSettled: () => setLoadingAction(null),
      }
    );
  };

  const handleDiscard = () => {
    setLoadingAction('discard');
    updatePhase(
      {
        phaseId,
        draft_description_multiloc: {},
      },
      {
        onSuccess: () => {
          setLoadingAction(null);
          setLocalDraft(descriptionMultiloc);
          setIsEditing(false);
        },
        onError: () => setLoadingAction(null),
      }
    );
  };

  if (isEditing) {
    return (
      <Box>
        <Box display="flex" justifyContent="flex-start" mb="8px">
          <Button
            buttonStyle="text"
            onClick={() => setIsEditing(false)}
            icon="arrow-left"
            padding="0px"
          >
            {formatMessage(messages.draftDescriptionGoToPublished)}
          </Button>
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Text fontWeight="bold" m="0px">
            {formatMessage(messages.draftDescriptionDraftTitle)}
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
          valueMultiloc={localDraft}
          onChange={handleDraftChange}
          withCTAButton
        />
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt="8px"
        >
          <Button
            buttonStyle="text"
            onClick={handleDiscard}
            padding="0px"
            processing={loadingAction === 'discard'}
            disabled={isLoading}
          >
            {formatMessage(messages.draftDescriptionDiscardChanges)}
          </Button>
          <Box display="flex" gap="8px">
            <Button
              buttonStyle="secondary-outlined"
              onClick={handleSaveDraft}
              processing={loadingAction === 'saveDraft'}
              disabled={isLoading}
            >
              {formatMessage(messages.draftDescriptionSaveDraft)}
            </Button>
            <Button
              buttonStyle="admin-dark"
              onClick={handlePublish}
              processing={loadingAction === 'publish'}
              disabled={isLoading}
            >
              {formatMessage(messages.draftDescriptionPublish)}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Text fontWeight="bold" m="0px">
          {formatMessage(messages.draftDescriptionPublishedTitle)}
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
        <Button buttonStyle="primary" onClick={handleClickToEdit}>
          {formatMessage(messages.draftDescriptionClickToEdit)}
        </Button>
      </Box>
    </Box>
  );
};

export default DraftPhaseDescription;
