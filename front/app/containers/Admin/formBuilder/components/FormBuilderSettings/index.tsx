import React from 'react';

// styles
import { colors } from 'utils/styleUtils';

// components
import { Box, Text, stylingConsts } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField, SectionTitle } from 'components/admin/Section';
import CloseIconButton from 'components/UI/CloseIconButton';
import InputMultilocWithLocaleSwitcher from 'components/HookForm/InputMultilocWithLocaleSwitcher';
import Toggle from 'components/HookForm/Toggle';

// intl
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

// Typings
import { MessageDescriptor } from 'typings';

interface Props {
  field: IFlatCustomFieldWithIndex;
  onDelete: (fieldIndex: number) => void;
  onClose: () => void;
}

const FormBuilderSettings = ({ field, onDelete, onClose }: Props) => {
  let translatedStringKey: MessageDescriptor | null = null;
  if (field.input_type === 'text') {
    translatedStringKey = messages.shortAnswer;
  }

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
          name={`customFields.${field.index}.title_multiloc`}
          label={<FormattedMessage {...messages.questionTitle} />}
          type="text"
        />
      </SectionField>
      <SectionField>
        <InputMultilocWithLocaleSwitcher
          name={`customFields.${field.index}.description_multiloc`}
          label={<FormattedMessage {...messages.questionDescription} />}
          type="text"
        />
      </SectionField>
      <SectionField>
        <Toggle
          name={`customFields.${field.index}.required`}
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
          onClick={() => onDelete(field.index)}
          minWidth="160px"
        >
          <FormattedMessage {...messages.delete} />
        </Button>
      </Box>
    </Box>
  );
};

export default FormBuilderSettings;
