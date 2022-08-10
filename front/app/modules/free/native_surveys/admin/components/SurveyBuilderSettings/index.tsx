import React, { useState, useEffect } from 'react';

// styles
import styled from 'styled-components';
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
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import {
  ISurveyCustomFieldData,
  ISurveyCustomFieldUpdate,
} from 'modules/free/native_surveys/services/surveyCustomFields';

import { Multiloc } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

interface Props {
  field?: ISurveyCustomFieldData;
  onDelete: (fieldId: string) => void;
  onFieldChange: (field: ISurveyCustomFieldUpdate) => void;
  onClose: () => void;
}

const SurveyBuilderSettings = ({
  field,
  onDelete,
  onFieldChange,
  onClose,
}: Props) => {
  // I'm keeping this form as simple as possible using state pending form rework from (TEC-35)
  const [fieldState, setFieldState] = useState({
    isRequired: field?.attributes.required,
    questionTitle: field?.attributes.title_multiloc,
    questionDescription: field?.attributes.description_multiloc,
  });

  useEffect(() => {
    if (!isNilOrError(field)) {
      onFieldChange({
        id: field.id,
        attributes: {
          title_multiloc: fieldState.questionTitle as Multiloc,
          description_multiloc: fieldState.questionDescription as Multiloc,
          required: !!fieldState.isRequired,
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldState]);

  if (isNilOrError(field)) {
    return null;
  }

  let translatedStringKey: ReactIntl.FormattedMessage.MessageDescriptor | null =
    null;
  if (field.attributes.input_type === 'text') {
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
    <StyledBox
      position="fixed"
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      zIndex="99999"
      px="20px"
      w="400px"
      h="100%"
      background="#ffffff"
    >
      <Box mb="20px">
        <Box position="absolute" right="8px">
          <CloseIconButton
            a11y_buttonActionMessage={messages.close}
            onClick={onClose}
            iconColor={colors.label}
            iconColorOnHover={'#000'}
          />
        </Box>
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
        <Box flexDirection="row" alignItems="center" justifyContent="center">
          <Toggle
            checked={!!isRequired}
            onChange={() => onStateChange('isRequired', !isRequired)}
            label={
              <Text
                as="span"
                color="adminTextColor"
                variant="bodyM"
                mt="0px"
                mb="0px"
              >
                <FormattedMessage {...messages.required} />
              </Text>
            }
          />
        </Box>
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
    </StyledBox>
  );
};

export default SurveyBuilderSettings;
