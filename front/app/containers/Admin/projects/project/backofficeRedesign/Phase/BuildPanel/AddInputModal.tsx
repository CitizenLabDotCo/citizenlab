import React from 'react';

import {
  Box,
  Button,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { boolean, ObjectSchema, object, string } from 'yup';

import usePhase from 'api/phases/usePhase';

import AuthorField from 'components/CustomFieldsForm/Fields/AuthorField';
import fieldMessages from 'components/CustomFieldsForm/messages';
import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import validateAtLeastOneLocale from 'utils/yup/validateAtLeastOneLocale';

import messages from '../../messages';

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
      opened
      close={onClose}
      width={560}
      variant="bo"
      header={formatMessage(copy.header)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-text" onClick={onClose}>
            {formatMessage(messages.statementCancel)}
          </Button>
          <Button buttonStyle="bo-primary" onClick={submit}>
            {formatMessage(messages.addStatement)}
          </Button>
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
        </Box>
      </FormProvider>
    </Modal>
  );
};

export default AddInputModal;
