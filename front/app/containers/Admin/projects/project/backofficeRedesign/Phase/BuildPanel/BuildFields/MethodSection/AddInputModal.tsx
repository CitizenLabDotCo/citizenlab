import React, { ReactNode, useRef, useState } from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { boolean, mixed, ObjectSchema, object, string } from 'yup';

import usePhase from 'api/phases/usePhase';

import FormMultilocRichTextField from 'components/admin/MultilocFields/FormMultilocRichTextField';
import FormMultilocTextField from 'components/admin/MultilocFields/FormMultilocTextField';
import AuthorField from 'components/CustomFieldsForm/Fields/AuthorField';
import fieldMessages from 'components/CustomFieldsForm/messages';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

import Banner from 'design-system/Banner';
import IconButton from 'design-system/IconButton';
import Modal from 'design-system/Modal';

import { useIntl } from 'utils/cl-intl';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';
import styles from './MethodSection.module.css';
import { InputValues } from './useStagedInputs';

const COPY = {
  statement: {
    header: messages.addAStatement,
    label: messages.statementLabel,
    placeholder: messages.statementPlaceholder,
    emptyError: messages.emptyStatementError,
    anonymousTooltip: messages.statementAnonymousTooltip,
  },
  option: {
    header: messages.addAnOption,
    label: messages.optionLabel,
    placeholder: messages.optionPlaceholder,
    emptyError: messages.emptyOptionError,
    anonymousTooltip: messages.optionAnonymousTooltip,
  },
  input: {
    header: messages.addAnInput,
    label: messages.inputTitleLabel,
    placeholder: messages.inputTitlePlaceholder,
    emptyError: messages.emptyInputTitleError,
    anonymousTooltip: messages.optionAnonymousTooltip,
  },
};

// The input forms fix these limits on the title.
const MIN_CHARACTERS = 3;
const MAX_CHARACTERS = 120;

interface Props {
  phaseId: string;
  kind: keyof typeof COPY;
  /** A returned promise keeps the modal open until it settles. */
  onSubmit: (values: InputValues) => void | Promise<unknown>;
  onClose: () => void;
  defaultValues?: InputValues;
  header?: string;
  submitLabel?: string;
  /** Leads to the input form, for the questions this modal leaves out. */
  fullFormLink?: ReactNode;
}

const AddInputModal = ({
  phaseId,
  kind,
  onSubmit,
  onClose,
  defaultValues,
  header,
  submitLabel,
  fullFormLink,
}: Props) => {
  const { formatMessage } = useIntl();
  const [saveFailed, setSaveFailed] = useState(false);
  // isSubmitting only updates after a render, so a double click needs this.
  const submitting = useRef(false);
  const { data: phase } = usePhase(phaseId);
  const allowAnonymous = !!phase?.data.attributes.allow_anonymous_participation;
  const copy = COPY[kind];
  const fieldName = formatMessage(copy.label);
  const isInput = kind === 'input';

  const schema: ObjectSchema<InputValues> = object({
    title_multiloc: validateAtLeastOneLocale(formatMessage(copy.emptyError), {
      validateEachNonEmptyLocale: (schema) =>
        schema
          .min(
            MIN_CHARACTERS,
            formatMessage(fieldMessages.fieldMinLength, {
              min: MIN_CHARACTERS,
              fieldName,
            })
          )
          .max(
            MAX_CHARACTERS,
            formatMessage(fieldMessages.fieldMaxLength, {
              max: MAX_CHARACTERS,
              fieldName,
            })
          ),
    }),
    // Whether it is required depends on the phase's form, so the API checks it.
    body_multiloc: mixed<Multiloc>(),
    author_id: string().nullable(),
    anonymous: boolean(),
  });

  const methods = useForm<InputValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const submit = methods.handleSubmit(async (values) => {
    if (submitting.current) return;

    submitting.current = true;
    setSaveFailed(false);
    try {
      await onSubmit(values);
      onClose();
    } catch {
      setSaveFailed(true);
    } finally {
      submitting.current = false;
    }
  });

  return (
    <Modal
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={560}
      title={header ?? formatMessage(copy.header)}
      secondaryAction={{
        label: formatMessage(messages.statementCancel),
        onPress: onClose,
      }}
      primaryAction={{
        label: submitLabel ?? formatMessage(messages.addStatement),
        isPending: methods.formState.isSubmitting,
        onPress: () => submit(),
      }}
    >
      <FormProvider {...methods}>
        <form className={styles.form} onSubmit={submit}>
          <div>
            <AuthorField name="author_id" variant="panel" />
          </div>
          <FormMultilocTextField
            name="title_multiloc"
            label={fieldName}
            placeholder={formatMessage(copy.placeholder)}
            maxCharCount={MAX_CHARACTERS}
          />
          {isInput && (
            <FormMultilocRichTextField
              name="body_multiloc"
              label={formatMessage(messages.inputDescriptionLabel)}
              aria-label={formatMessage(messages.inputDescriptionLabel)}
              noImages
              noVideos
            />
          )}
          {allowAnonymous && (
            <div>
              <div className={styles.visibilityLabel}>
                <span className={styles.helper}>
                  {formatMessage(messages.statementProfileVisibility)}
                </span>
                <IconButton
                  icon="info-16"
                  size={24}
                  aria-label={formatMessage(copy.anonymousTooltip)}
                />
              </div>
              <CheckboxWithLabel
                name="anonymous"
                size="20px"
                label={
                  <span className={styles.control}>
                    {formatMessage(messages.statementPostAnonymously)}
                  </span>
                }
              />
            </div>
          )}
          {saveFailed && (
            <Banner tone="error">
              {formatMessage(
                isInput
                  ? messages.inputSaveFailedFullForm
                  : messages.inputSaveFailed
              )}
            </Banner>
          )}
          {/* The modal footer only holds its two actions, so the link to the
              full form ends the body. */}
          {fullFormLink && <div>{fullFormLink}</div>}
        </form>
      </FormProvider>
    </Modal>
  );
};

export default AddInputModal;
