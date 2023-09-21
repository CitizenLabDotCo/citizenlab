import React from 'react';
import { useFormContext } from 'react-hook-form';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { DragAndDropResult, NestedGroupingStructure } from '../../edit/utils';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import {
  builtInFieldKeys,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';
import { FormField } from './FormField';

// hooks and services
import useLocale from 'hooks/useLocale';
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

import { DragAndDrop, Drag, Drop } from '../DragAndDrop';

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

  const shouldShowField = (field: IFlatCustomField) => {
    if (builtInFieldKeys.includes(field.key)) {
      return field.enabled;
    }
    return true;
  };

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
          {nestedGroupData.map((grouping, pageIndex) => {
            return (
              <Drag key={grouping.id} id={grouping.id} index={pageIndex}>
                <FormField
                  field={grouping.groupElement}
                  isEditingDisabled={isEditingDisabled}
                  selectedFieldId={selectedFieldId}
                  onEditField={onEditField}
                  builderConfig={builderConfig}
                />
                <Drop key={grouping.id} id={grouping.id} type={questionDNDType}>
                  <Box height="100%">
                    {grouping.questions.length === 0 ? (
                      <Box height="0.5px" />
                    ) : (
                      <>
                        {grouping.questions.map((question, index) => {
                          return shouldShowField(question) ? (
                            <Drag
                              key={question.id}
                              id={question.id}
                              index={index}
                            >
                              <FormField
                                key={question.id}
                                field={question}
                                isEditingDisabled={isEditingDisabled}
                                selectedFieldId={selectedFieldId}
                                onEditField={onEditField}
                                builderConfig={builderConfig}
                              />
                            </Drag>
                          ) : (
                            <Box height="1px" />
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
