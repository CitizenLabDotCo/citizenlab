import React from 'react';

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

// services
import { ISurveyCustomFieldData } from 'modules/free/native_surveys/services/surveyCustomFields';

const StyledBox = styled(Box)`
  box-shadow: -2px 0px 1px 0px rgba(0, 0, 0, 0.06);
`;

interface Props {
  field?: ISurveyCustomFieldData;
}

const SurveyBuilderSettings = ({ field }: Props) => {
  if (!field) {
    return null;
  }

  return (
    <StyledBox
      position="fixed"
      right="0"
      top={`${stylingConsts.menuHeight}px`}
      zIndex="99999"
      p="20px"
      w="400px"
      h="100%"
      background="#ffffff"
    >
      <Title variant="h2">
        <FormattedMessage {...messages.shortAnswer} />
      </Title>
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={<FormattedMessage {...messages.questionTitle} />}
        valueMultiloc={field.attributes.title_multiloc}
      />
      <InputMultilocWithLocaleSwitcher
        type="text"
        label={<FormattedMessage {...messages.questionDescription} />}
        valueMultiloc={field.attributes.description_multiloc}
      />
      <Toggle checked={field.attributes.required} onChange={() => {}} />
      <Box display="flex" justifyContent="space-between">
        <Button
          buttonStyle="primary"
          onClick={() => {
            // TODO: Handle save
          }}
          minWidth="160px"
        >
          <FormattedMessage {...messages.save} />
        </Button>
        <Button
          icon="delete"
          buttonStyle="primary-outlined"
          borderColor={colors.red500}
          textColor={colors.red500}
          iconColor={colors.red500}
          onClick={() => {
            // TODO: Handle delete
          }}
          minWidth="160px"
        >
          <FormattedMessage {...messages.delete} />
        </Button>
      </Box>
    </StyledBox>
  );
};

export default SurveyBuilderSettings;
