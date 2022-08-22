import React, { useState, useEffect } from 'react';
import { cloneDeep } from 'lodash-es';

// styles
import { colors } from 'utils/styleUtils';

// components
import {
  Box,
  Toggle,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { SectionField, SectionTitle } from 'components/admin/Section';
import CloseIconButton from 'components/UI/CloseIconButton';
import Error from 'components/UI/Error';

// intl
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// Types
import { Multiloc, CLError } from 'typings';

import {
  IFlatCustomField,
  IFlatUpdateCustomField,
} from 'services/formCustomFields';

import { isNilOrError } from 'utils/helperUtils';

type SelectedError = {
  [fieldId: string]: CLError[] | null;
} | null;

interface Props {
  field: IFlatCustomField;
  onDelete: (fieldId: string) => void;
  onFieldChange: (field: IFlatUpdateCustomField) => void;
  onClose: () => void;
  errors: SelectedError;
  setErrors: (fieldId: string, errors: SelectedError) => void;
}

const settingInputs = [
  'title_multiloc',
  'description_multiloc',
  'required',
] as const;

type KeyErrorType = {
  [key: string]: CLError[] | null;
};

const FormBuilderSettings = ({
  field,
  onDelete,
  onFieldChange,
  onClose,
  errors,
  setErrors,
}: Props) => {
  // TODO I'm keeping this form as simple as possible using state pending form rework from (TEC-35)
  const [fieldState, setFieldState] = useState({
    required: field.required || false,
    title_multiloc: field.title_multiloc || {},
    description_multiloc: field.description_multiloc || {},
  });

  const keyErrors: KeyErrorType = {
    title_multiloc: null,
    description_multiloc: null,
    required: null,
  };

  if (!isNilOrError(errors)) {
    const fieldError = errors[field.id] as unknown as CLError[];

    settingInputs.forEach((input) => {
      if (fieldError && input in fieldError) {
        keyErrors[input] = [fieldError[input][0]];
      }
    });
  }

  useEffect(() => {
    onFieldChange({
      ...field,
      id: field.id,
      title_multiloc: fieldState.title_multiloc,
      description_multiloc: fieldState.description_multiloc,
      required: !!fieldState.required,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldState]);

  let translatedStringKey: ReactIntl.FormattedMessage.MessageDescriptor | null =
    null;
  if (field.input_type === 'text') {
    translatedStringKey = messages.shortAnswer;
  }

  const onStateChange = (key: string, value: Multiloc | boolean) => {
    setFieldState({
      ...fieldState,
      [key]: value,
    });

    if (!isNilOrError(errors)) {
      const newErrors = cloneDeep(errors);
      const fieldError = newErrors[field.id] as unknown as CLError[];

      if (fieldError && key in fieldError) {
        delete fieldError[key];
      }

      setErrors(field.id, newErrors);
    }
  };

  const errorComponentProps = {
    marginTop: '8px',
    marginBottom: '8px',
    scrollIntoView: false,
  };
  const { required, title_multiloc, description_multiloc } = fieldState;

  return (
    <Box
      position="fixed"
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      zIndex="99999"
      px="20px"
      w="400px"
      h="100%"
      background="white"
      boxShadow="-2px 0px 1px 0px rgba(0, 0, 0, 0.06)"
    >
      <Box position="absolute" right="8px" mb="20px">
        <CloseIconButton
          a11y_buttonActionMessage={messages.close}
          onClick={onClose}
          iconColor={colors.label}
          iconColorOnHover={'#000'}
        />
      </Box>
      {translatedStringKey && (
        <SectionTitle>
          <FormattedMessage {...translatedStringKey} />
        </SectionTitle>
      )}
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          label={<FormattedMessage {...messages.questionTitle} />}
          valueMultiloc={title_multiloc}
          onChange={(value: Multiloc) => onStateChange('title_multiloc', value)}
        />
        <Error
          {...errorComponentProps}
          apiErrors={keyErrors['title_multiloc']}
        />
      </SectionField>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          label={<FormattedMessage {...messages.questionDescription} />}
          valueMultiloc={description_multiloc}
          onChange={(value: Multiloc) =>
            onStateChange('description_multiloc', value)
          }
        />
        <Error
          {...errorComponentProps}
          apiErrors={keyErrors['description_multiloc']}
        />
      </SectionField>
      <SectionField>
        <Toggle
          checked={!!required}
          onChange={() => onStateChange('required', !required)}
          label={
            <Text as="span" color="adminTextColor" variant="bodyM" my="0px">
              <FormattedMessage {...messages.required} />
            </Text>
          }
        />
        <Error {...errorComponentProps} apiErrors={keyErrors['required']} />
      </SectionField>
      <Box display="flex" justifyContent="space-between">
        <Button
          icon="delete"
          buttonStyle="primary-outlined"
          borderColor={colors.red500}
          textColor={colors.red500}
          iconColor={colors.red500}
          onClick={() => onDelete(field.id)}
          minWidth="160px"
        >
          <FormattedMessage {...messages.delete} />
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilderSettings;
