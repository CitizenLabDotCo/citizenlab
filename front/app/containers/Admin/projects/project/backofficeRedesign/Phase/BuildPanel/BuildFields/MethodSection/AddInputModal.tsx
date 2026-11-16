import React from 'react';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { boolean, ObjectSchema, object, string } from 'yup';

import usePhase from 'api/phases/usePhase';

import FormMultilocTextField from 'components/admin/MultilocFields/FormMultilocTextField';
import AuthorField from 'components/CustomFieldsForm/Fields/AuthorField';
import fieldMessages from 'components/CustomFieldsForm/messages';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';

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
};

// The input forms fix these limits on the title.
const MIN_CHARACTERS = 3;
const MAX_CHARACTERS = 120;

interface Props {
  phaseId: string;
  kind: keyof typeof COPY;
  onSubmit: (values: InputValues) => void;
  onClose: () => void;
}

const AddInputModal = ({ phaseId, kind, onSubmit, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const allowAnonymous = !!phase?.data.attributes.allow_anonymous_participation;
  const copy = COPY[kind];
  const fieldName = formatMessage(copy.label);

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
    author_id: string().nullable(),
    anonymous: boolean(),
  });

  const methods = useForm<InputValues>({
    mode: 'onTouched',
    resolver: yupResolver(schema),
  });

  const submit = methods.handleSubmit((values) => {
    onSubmit(values);
    onClose();
  });

  return (
    <Modal
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={560}
      title={formatMessage(copy.header)}
      secondaryAction={{
        label: formatMessage(messages.statementCancel),
        onPress: onClose,
      }}
      primaryAction={{
        label: formatMessage(messages.addStatement),
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
        </form>
      </FormProvider>
    </Modal>
  );
};

export default AddInputModal;
