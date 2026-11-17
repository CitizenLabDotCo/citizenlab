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
import { Controller, useForm, FormProvider } from 'react-hook-form';
import { Multiloc } from 'typings';

import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import MultilocRichTextField from 'components/admin/MultilocFields/MultilocRichTextField';
import { usePhasePreviewPublisher } from 'components/admin/PhasePreview/DraftContext';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import Banner from 'design-system/Banner';
import DSButton from 'design-system/Button';
import DSIcon from 'design-system/Icon';
import IconButton from 'design-system/IconButton';
import DSSpinner from 'design-system/Spinner';

import { useIntl } from 'utils/cl-intl';
import { isEmptyMultiloc } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import styles from './DraftPhaseDescription.module.css';
import StatusBadges from './StatusBadges';
import 'design-system/tokens.css';

const AUTOSAVE_DEBOUNCE_MS = 1000;

interface FormValues {
  draft_description_multiloc: Multiloc;
}

interface Props {
  phaseId: string;
  descriptionMultiloc: Multiloc;
  draftDescriptionMultiloc: Multiloc | undefined;
  variant?: 'default' | 'panel';
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
  const isPanel = variant === 'panel';
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

  const preview = usePhasePreviewPublisher('description', phaseId);
  React.useEffect(() => {
    const subscription = methods.watch(() =>
      preview.publish({
        description_multiloc: methods.getValues('draft_description_multiloc'),
        draft_description_multiloc: {},
      })
    );
    return () => subscription.unsubscribe();
  }, [methods, preview]);

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
      {
        onSuccess: () => {
          preview.clear();
          setIsEditing(false);
        },
      }
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
          preview.clear();
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

  const showEmptyWarning =
    phases && phases.data.length < 2 && isEmptyMultiloc(descriptionMultiloc);

  if (isPanel) {
    return (
      <FormProvider {...methods}>
        <div>
          {showEmptyWarning && (
            <div className={styles.warning}>
              <Banner tone="info">
                {formatMessage(messages.emptyDescriptionWarning)}
              </Banner>
            </div>
          )}
          <Controller
            name="draft_description_multiloc"
            control={methods.control}
            render={({ field }) => (
              <MultilocRichTextField
                id="draft_description_multiloc"
                label={
                  <span className={styles.badges}>
                    <StatusBadges isEditing={!!isEditing} isPanel />
                    <IconButton
                      icon="info-16"
                      size={24}
                      aria-label={statusTooltip}
                    />
                  </span>
                }
                aria-label={formatMessage(messages.descriptionLabel)}
                placeholder={placeholder}
                valueMultiloc={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onFocus={isEditing ? undefined : handleClickToEdit}
                withCTAButton
              />
            )}
          />
          {isEditing && (
            <div className={styles.footer}>
              <DSButton
                variant="quiet"
                onPress={handleDiscard}
                isDisabled={isPending}
              >
                {formatMessage(messages.draftDescriptionDiscardChanges)}
              </DSButton>
              <div className={styles.saveGroup}>
                {isDraftLoading ? (
                  <div className={styles.saveState}>
                    <DSSpinner />
                    <span className={styles.saveStateText}>
                      {formatMessage(messages.draftDescriptionSaving)}
                    </span>
                  </div>
                ) : !hasPendingChanges ? (
                  <div className={styles.saveState}>
                    <DSIcon name="check-14" className={styles.savedIcon} />
                    <span className={styles.saveStateText}>
                      {formatMessage(messages.draftDescriptionSaved)}
                    </span>
                  </div>
                ) : null}
                <DSButton
                  variant="primary"
                  onPress={handlePublish}
                  isDisabled={isPending}
                >
                  {formatMessage(messages.draftDescriptionPublish)}
                </DSButton>
              </div>
            </div>
          )}
        </div>
      </FormProvider>
    );
  }

  return (
    <FormProvider {...methods}>
      <Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Text fontWeight="bold" m="0px">
            {formatMessage(messages.descriptionLabel)}
          </Text>
          <IconTooltip content={statusTooltip} />
          <StatusBadges isEditing={!!isEditing} isPanel={false} />
        </Box>
        {showEmptyWarning && (
          <Box mt="16px" mb="16px">
            <Warning>{formatMessage(messages.emptyDescriptionWarning)}</Warning>
          </Box>
        )}
        <QuillMultilocWithLocaleSwitcher
          name="draft_description_multiloc"
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
              buttonStyle="text"
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
                buttonStyle="admin-dark"
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
