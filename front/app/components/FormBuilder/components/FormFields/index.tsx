import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { DragAndDropResult, NestedGroupingStructure } from '../../edit/utils';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  builtInFieldKeys,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';
import { FieldElement } from './FieldElement';

// hooks and services
import useLocale from 'hooks/useLocale';
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

import { DragAndDrop, Drag, Drop } from '../DragAndDrop';

// Assign field badge text
const getTranslatedFieldType = (field: IFlatCustomField) => {
  const switchKey = builtInFieldKeys.includes(field.key)
    ? field.key
    : field.input_type;
  switch (switchKey) {
    case 'text':
    case 'title_multiloc':
      return messages.shortAnswer;
    case 'multiline_text':
    case 'body_multiloc':
      return messages.longAnswer;
    case 'multiselect':
      return messages.multipleChoice;
    case 'select':
      return messages.singleChoice;
    case 'page':
      return messages.page;
    case 'number':
      return messages.number;
    case 'linear_scale':
      return messages.linearScale;
    case 'file_upload':
      return messages.fileUpload;
    case 'idea_images_attributes':
      return messages.imageUpload;
    case 'location_description':
      return messages.locationDescription;
    default:
      return messages.default;
  }
};

export const pageDNDType = 'droppable-page';
export const questionDNDType = 'droppable-question';

interface FormFieldsProps {
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  handleDragEnd: (
    result: DragAndDropResult,
    nestedGroupData: NestedGroupingStructure[]
  ) => void;
  isEditingDisabled: boolean;
  selectedFieldId?: string;
  builderConfig: FormBuilderConfig;
}

const FormFields = ({
  onEditField,
  selectedFieldId,
  isEditingDisabled,
  handleDragEnd,
  builderConfig,
}: FormFieldsProps) => {
  const { watch, trigger } = useFormContext();
  const locale = useLocale();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locale)) {
    return null;
  }

  const nestedGroupData: NestedGroupingStructure[] = [];
  formCustomFields.forEach((field) => {
    if (['page', 'section'].includes(field.input_type)) {
      nestedGroupData.push({
        groupElement: field,
        questions: [],
        id: field.id,
      });
    } else {
      const lastGroupElement = nestedGroupData[nestedGroupData.length - 1];
      lastGroupElement.questions.push({
        ...field,
      });
    }
  });

  return (
    <Box height="100%">
      <DragAndDrop
        onDragEnd={(result: DragAndDropResult) => {
          handleDragEnd(result, nestedGroupData);
          trigger();
        }}
      >
        <Drop id="droppable" type={pageDNDType}>
          {nestedGroupData.map((pageGrouping, pageIndex) => {
            return (
              <Drag
                key={pageGrouping.id}
                id={pageGrouping.id}
                index={pageIndex}
              >
                <FieldElement
                  field={pageGrouping.groupElement}
                  isEditingDisabled={isEditingDisabled}
                  getTranslatedFieldType={getTranslatedFieldType}
                  selectedFieldId={selectedFieldId}
                  onEditField={onEditField}
                  builderConfig={builderConfig}
                />
                <Drop
                  key={pageGrouping.id}
                  id={pageGrouping.id}
                  type={questionDNDType}
                >
                  <Box height="100%">
                    {pageGrouping.questions.length === 0 ? (
                      <Box height="0.5px" />
                    ) : (
                      <>
                        {pageGrouping.questions.map((question, index) => {
                          return (
                            <Drag
                              key={question.id}
                              id={question.id}
                              index={index}
                            >
                              <FieldElement
                                key={question.id}
                                field={question}
                                isEditingDisabled={isEditingDisabled}
                                getTranslatedFieldType={getTranslatedFieldType}
                                selectedFieldId={selectedFieldId}
                                onEditField={onEditField}
                                builderConfig={builderConfig}
                              />
                            </Drag>
                          );
                        })}
                      </>
                    )}
                  </Box>
                </Drop>
              </Drag>
            );
          })}
        </Drop>
      </DragAndDrop>
      {formCustomFields.length > 0 && (
        <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
      )}
    </Box>
  );
};

export default FormFields;
