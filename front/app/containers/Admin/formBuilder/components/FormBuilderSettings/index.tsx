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
import ConfigMultiselectWithLocaleSwitcher from './ConfigMultiselectWithLocaleSwitcher';
import LinearScaleSettings from './LinearScaleSettings';

// intl
import messages from '../messages';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// types
import { IFlatCustomFieldWithIndex } from 'services/formCustomFields';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  field: IFlatCustomFieldWithIndex;
  onDelete: (fieldIndex: number) => void;
  onClose: () => void;
}

const FormBuilderSettings = ({ field, onDelete, onClose }: Props) => {
  const locales = useAppConfigurationLocales();

  if (isNilOrError(locales)) {
    return null;
  }

  let translatedStringKey: MessageDescriptor | null = null;
  switch (field.input_type) {
    case 'text':
      translatedStringKey = messages.shortAnswer;
      break;
    case 'multiselect':
      translatedStringKey = messages.multipleChoice;
      break;
    case 'number':
      translatedStringKey = messages.number;
      break;
    case 'linear_scale':
      translatedStringKey = messages.linearScale;
      break;
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
      {field.input_type === 'multiselect' && ( // TODO: Remove this - just temporary for testing
        <ConfigMultiselectWithLocaleSwitcher // TODO: Abstract logic to somewhere else
          name={`customFields.${field.index}.options`}
          locales={locales}
        />
      )}
      {field.input_type === 'linear_scale' && ( // TODO: Remove this - just temporary for testing
        <LinearScaleSettings // TODO: Abstract logic to somewhere else
          maximumName={`customFields.${field.index}.maximum`}
          minimumLabelName={`customFields.${field.index}.minimum_label_multiloc`}
          maximumLabelName={`customFields.${field.index}.maximum_label_multiloc`}
          locales={locales}
        />
      )}
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
