import React, { ReactNode, useRef, useState } from 'react';

import {
  Box,
  Button,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';
import { boolean, mixed, ObjectSchema, object, string } from 'yup';

import usePhase from 'api/phases/usePhase';

import AuthorField from 'components/CustomFieldsForm/Fields/AuthorField';
import fieldMessages from 'components/CustomFieldsForm/messages';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Error from 'components/UI/Error';
import Modal, { MEDIUM_MODAL_WIDTH } from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from './messages';
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
      opened
      close={onClose}
      width={MEDIUM_MODAL_WIDTH}
      variant="bo"
      header={header ?? formatMessage(copy.header)}
      footer={
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="8px"
          width="100%"
        >
          <Box>{fullFormLink}</Box>
          <Box display="flex" gap="8px">
            <Button buttonStyle="bo-text" onClick={onClose}>
              {formatMessage(messages.statementCancel)}
            </Button>
            <Button
              buttonStyle="bo-primary"
              processing={methods.formState.isSubmitting}
              onClick={submit}
            >
              {submitLabel ?? formatMessage(messages.addStatement)}
            </Button>
          </Box>
        </Box>
      }
    >
      <FormProvider {...methods}>
        <Box
          as="form"
          p="24px"
          display="flex"
          flexDirection="column"
          gap="24px"
          onSubmit={submit}
        >
          <Box>
            <AuthorField name="author_id" variant="bo" />
          </Box>
          <InputMultilocWithLocaleSwitcher
            name="title_multiloc"
            variant="bo"
            label={fieldName}
            placeholder={formatMessage(copy.placeholder)}
            maxCharCount={MAX_CHARACTERS}
          />
          {isInput && (
            <QuillMultilocWithLocaleSwitcher
              id="add-input-description"
              name="body_multiloc"
              variant="bo"
              label={formatMessage(messages.inputDescriptionLabel)}
              noImages
              noVideos
            />
          )}
          {allowAnonymous && (
            <Box>
              <Box display="flex" alignItems="center" gap="4px" mb="8px">
                <Text as="span" variant="boHelper" fontSize="xs" m="0">
                  {formatMessage(messages.statementProfileVisibility)}
                </Text>
                <IconTooltip
                  content={
                    <Text color="white" fontSize="s" m="0">
                      {formatMessage(copy.anonymousTooltip)}
                    </Text>
                  }
                  placement="top-start"
                />
              </Box>
              <CheckboxWithLabel
                name="anonymous"
                size="20px"
                label={
                  <Text as="span" variant="boControl" m="0">
                    {formatMessage(messages.statementPostAnonymously)}
                  </Text>
                }
              />
            </Box>
          )}
          {saveFailed && (
            <Error
              text={formatMessage(
                isInput
                  ? messages.inputSaveFailedFullForm
                  : messages.inputSaveFailed
              )}
            />
          )}
        </Box>
      </FormProvider>
    </Modal>
  );
};

export default AddInputModal;
