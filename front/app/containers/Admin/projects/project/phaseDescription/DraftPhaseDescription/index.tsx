import React, { useState, useMemo } from 'react';

import {
  Box,
  Text,
  Button,
  IconTooltip,
  Spinner,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';

import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import { QuillVariant } from 'components/UI/QuillEditor/StyleContainer';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import StatusBadges from './StatusBadges';

const AUTOSAVE_DEBOUNCE_MS = 1000;

interface FormValues {
  draft_description_multiloc: Multiloc;
}

interface Props {
  phaseId: string;
  descriptionMultiloc: Multiloc;
  draftDescriptionMultiloc: Multiloc | undefined;
  variant?: QuillVariant;
  placeholder?: string;
}

const DraftPhaseDescription = ({
  phaseId,
  descriptionMultiloc,
  draftDescriptionMultiloc: initialDraft,
  variant = 'default',
  placeholder,
}: Props) => {
  const { formatMessage } = useIntl();
  const isBo = variant === 'bo';
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: phases } = usePhases(projectId);
  const { mutate: updatePhase, isPending } = useUpdatePhase();
  const { mutate: updateDraftPhaseDescription, isPending: isDraftLoading } =
    useUpdatePhase();

  const hasSavedDraft = initialDraft && !isEmptyMultiloc(initialDraft);
  const [isEditing, setIsEditing] = useState(hasSavedDraft);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

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
        setHasPendingChanges(false);
        updateDraftPhaseDescription({
          phaseId,
          draft_description_multiloc: value,
        });
      }, AUTOSAVE_DEBOUNCE_MS),
    [updateDraftPhaseDescription, phaseId]
  );

  methods.watch((data) => {
    if (isEditing && data.draft_description_multiloc) {
      setHasPendingChanges(true);
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
          debouncedSaveDraft.cancel();
          setIsEditing(false);
        },
      }
    );
  };

  const statusTooltip = formatMessage(
    isEditing
      ? messages.draftDescriptionDraftTooltip
      : messages.draftDescriptionPublishedTooltip
  );

  return (
    <FormProvider {...methods}>
      <Box>
        {!isBo && (
          <Box display="flex" alignItems="center" gap="8px">
            <Text fontWeight="bold" m="0px">
              {formatMessage(messages.descriptionLabel)}
            </Text>
            <IconTooltip content={statusTooltip} />
            <StatusBadges isEditing={!!isEditing} variant={variant} />
          </Box>
        )}
        {phases &&
          phases.data.length < 2 &&
          isEmptyMultiloc(descriptionMultiloc) && (
            <Box mt={isBo ? '0px' : '16px'} mb={isBo ? '8px' : '16px'}>
              <Warning variant={variant}>
                {formatMessage(messages.emptyDescriptionWarning)}
              </Warning>
            </Box>
          )}
        <QuillMultilocWithLocaleSwitcher
          name="draft_description_multiloc"
          variant={variant}
          minHeight={isBo ? '74px' : undefined}
          label={
            isBo ? (
              <StatusBadges isEditing={!!isEditing} variant={variant} />
            ) : undefined
          }
          labelTooltipText={isBo ? statusTooltip : undefined}
          ariaLabel={
            isBo ? formatMessage(messages.descriptionLabel) : undefined
          }
          placeholder={placeholder}
          withCTAButton
          onFocus={isEditing ? undefined : handleClickToEdit}
        />
        {isEditing && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap="8px"
            mt="8px"
          >
            <Button
              buttonStyle={isBo ? 'bo-text' : 'text'}
              boSize={isBo ? 'medium' : undefined}
              textDecoration={isBo ? 'underline' : undefined}
              onClick={handleDiscard}
              padding="0px"
              disabled={isPending}
            >
              {formatMessage(messages.draftDescriptionDiscardChanges)}
            </Button>
            <Box display="flex" gap="16px" alignItems="center">
              {isDraftLoading ? (
                <Box display="flex" alignItems="center" gap="8px">
                  <Spinner size="20px" />
                  <Text m="0px" fontSize="s" color="textSecondary">
                    {formatMessage(messages.draftDescriptionSaving)}
                  </Text>
                </Box>
              ) : !hasPendingChanges ? (
                <Box display="flex" alignItems="center" gap="8px">
                  <Icon name="check" fill={colors.success} />
                  <Text m="0px" fontSize="s" color="textSecondary">
                    {formatMessage(messages.draftDescriptionSaved)}
                  </Text>
                </Box>
              ) : null}
              <Button
                buttonStyle={isBo ? 'bo-primary' : 'admin-dark'}
                boSize={isBo ? 'medium' : undefined}
                onClick={handlePublish}
                disabled={isPending}
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
