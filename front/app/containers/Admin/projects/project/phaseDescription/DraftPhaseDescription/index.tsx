import React, { useState, useMemo } from 'react';

import {
  Box,
  Text,
  Button,
  IconTooltip,
  Spinner,
  StatusLabel,
  colors,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';

import useUpdatePhase from 'api/phases/useUpdatePhase';

import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const AUTOSAVE_DEBOUNCE_MS = 1000;

interface FormValues {
  draft_description_multiloc: Multiloc;
}

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

  const hasSavedDraft = initialDraft && Object.keys(initialDraft).length > 0;
  const [isEditing, setIsEditing] = useState(hasSavedDraft);

  const methods = useForm<FormValues>({
    defaultValues: {
      draft_description_multiloc: hasSavedDraft
        ? initialDraft
        : descriptionMultiloc,
    },
  });

  const debouncedSaveDraft = useMemo(
    () =>
      debounce((value: Multiloc) => {
        updatePhase({ phaseId, draft_description_multiloc: value });
      }, AUTOSAVE_DEBOUNCE_MS),
    [updatePhase, phaseId]
  );

  methods.watch((data) => {
    if (isEditing && data.draft_description_multiloc) {
      debouncedSaveDraft(data.draft_description_multiloc as Multiloc);
    }
  });

  const handleClickToEdit = () => {
    if (!hasSavedDraft) {
      methods.reset({ draft_description_multiloc: descriptionMultiloc });
    }
    setIsEditing(true);
  };

  const blurEditor = () => {
    window.getSelection()?.removeAllRanges();
  };

  const handlePublish = () => {
    debouncedSaveDraft.cancel();
    blurEditor();
    updatePhase(
      {
        phaseId,
        description_multiloc: methods.getValues('draft_description_multiloc'),
        draft_description_multiloc: {},
      },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleDiscard = () => {
    debouncedSaveDraft.cancel();
    blurEditor();
    updatePhase(
      { phaseId, draft_description_multiloc: {} },
      {
        onSuccess: () => {
          methods.reset({ draft_description_multiloc: descriptionMultiloc });
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <FormProvider {...methods}>
      <Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Text fontWeight="bold" m="0px">
            {formatMessage(
              isEditing
                ? messages.draftDescriptionDraftTitle
                : messages.draftDescriptionPublishedTitle
            )}
          </Text>
          <IconTooltip
            content={formatMessage(
              isEditing
                ? messages.draftDescriptionDraftTooltip
                : messages.draftDescriptionPublishedTooltip
            )}
          />
          <StatusLabel
            text={formatMessage(
              isEditing
                ? messages.draftDescriptionDraftBadge
                : messages.draftDescriptionPublishedBadge
            )}
            backgroundColor={isEditing ? colors.orange500 : colors.green500}
          />
        </Box>
        <QuillMultilocWithLocaleSwitcher
          name="draft_description_multiloc"
          withCTAButton
          onFocus={isEditing ? undefined : handleClickToEdit}
        />
        {isEditing && (
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
              disabled={isLoading}
            >
              {formatMessage(messages.draftDescriptionDiscardChanges)}
            </Button>
            <Box display="flex" gap="8px" alignItems="center">
              {isLoading && (
                <Box display="flex" alignItems="center" gap="4px">
                  <Spinner size="21px" />
                  <Text m="0px" fontSize="s" color="textSecondary">
                    {formatMessage(messages.draftDescriptionSaving)}
                  </Text>
                </Box>
              )}
              <Button
                buttonStyle="admin-dark"
                onClick={handlePublish}
                disabled={isLoading}
              >
                {formatMessage(messages.draftDescriptionPublish)}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </FormProvider>
  );
};

export default DraftPhaseDescription;
