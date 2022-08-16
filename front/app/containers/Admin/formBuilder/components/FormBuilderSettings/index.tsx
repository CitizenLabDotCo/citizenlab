import React, { useState, useEffect } from 'react';

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

// intl
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// Types
import { Multiloc } from 'typings';

import {
  IFlatCustomField,
  IFlatUpdateCustomField,
} from 'services/formCustomFields';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  field?: IFlatCustomField;
  onDelete: (fieldId: string) => void;
  onFieldChange: (field: IFlatUpdateCustomField) => void;
  onClose: () => void;
}

const FormBuilderSettings = ({
  field,
  onDelete,
  onFieldChange,
  onClose,
}: Props) => {
  // I'm keeping this form as simple as possible using state pending form rework from (TEC-35)
  const [fieldState, setFieldState] = useState({
    isRequired: field?.required || false,
    questionTitle: field?.title_multiloc || {},
    questionDescription: field?.description_multiloc || {},
  });

  useEffect(() => {
    if (!isNilOrError(field)) {
      onFieldChange({
        ...field,
        id: field.id,
        title_multiloc: fieldState.questionTitle,
        description_multiloc: fieldState.questionDescription,
        required: !!fieldState.isRequired,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldState]);

  if (isNilOrError(field)) {
    return null;
  }

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
  };

  const { isRequired, questionTitle, questionDescription } = fieldState;

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
          valueMultiloc={questionTitle}
          onChange={(value: Multiloc) => onStateChange('questionTitle', value)}
        />
      </SectionField>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          type="text"
          label={<FormattedMessage {...messages.questionDescription} />}
          valueMultiloc={questionDescription}
          onChange={(value: Multiloc) =>
            onStateChange('questionDescription', value)
          }
        />
      </SectionField>
      <SectionField>
        <Toggle
          checked={!!isRequired}
          onChange={() => onStateChange('isRequired', !isRequired)}
          label={
            <Text as="span" color="adminTextColor" variant="bodyM" my="0px">
              <FormattedMessage {...messages.required} />
            </Text>
          }
        />
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
