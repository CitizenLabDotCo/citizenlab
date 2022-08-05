import React, { useState } from 'react';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import {
  Title,
  Box,
  Toggle,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

import {
  ISurveyCustomFieldData,
  updateSurveyCustomField,
} from 'modules/free/native_surveys/services/surveyCustomFields';

import { Multiloc } from 'typings';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

interface Props {
  field?: ISurveyCustomFieldData;
  onDelete: (fieldId: string) => void;
}

const SurveyBuilderSettings = ({ field, onDelete }: Props) => {
  // I'm keeping this form as simple as possible using state pending form rework from (TEC-35)
  const [isRequired, setIsRequired] = useState<boolean | undefined>(
    field?.attributes.required
  );
  const [questionTitle, setQuestionTitle] = useState<Multiloc | undefined>(
    field?.attributes.title_multiloc
  );
  const [questionDescription, setQuestionDescription] = useState<
    Multiloc | undefined
  >(field?.attributes.description_multiloc);

  if (!field) {
    return null;
  }
  let translatedStringKey: ReactIntl.FormattedMessage.MessageDescriptor | null =
    null;
  if (field.attributes.input_type === 'text') {
    translatedStringKey = messages.shortAnswer;
  }

  const onSave = () => {
    updateSurveyCustomField(field.id, {
      title_multiloc: questionTitle,
      description_multiloc: questionDescription,
      required: isRequired,
    });
  };

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
      {translatedStringKey && (
        <Title variant="h2">
          <FormattedMessage {...translatedStringKey} />
        </Title>
      )}
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={<FormattedMessage {...messages.questionTitle} />}
        valueMultiloc={questionTitle}
        onChange={setQuestionTitle}
      />
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={<FormattedMessage {...messages.questionDescription} />}
        valueMultiloc={questionDescription}
        onChange={setQuestionDescription}
      />
      <Toggle
        checked={!!isRequired}
        onChange={() => {
          setIsRequired(!isRequired);
        }}
      />
      <Box display="flex" justifyContent="space-between">
        <Button buttonStyle="primary" onClick={onSave} minWidth="160px">
          <FormattedMessage {...messages.save} />
        </Button>
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
