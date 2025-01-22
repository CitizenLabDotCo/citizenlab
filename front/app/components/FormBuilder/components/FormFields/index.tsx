import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';

import {
  builtInFieldKeys,
  FormBuilderConfig,
} from 'components/FormBuilder/utils';

import { DragAndDropResult, NestedGroupingStructure } from '../../edit/utils';
import { DragAndDrop, Drag, Drop } from '../DragAndDrop';
import { getFieldNumbers } from '../utils';

import { FormField } from './FormField';

export const pageDNDType = 'droppable-page';
export const questionDNDType = 'droppable-question';

interface FormFieldsProps {
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  handleDragEnd: (
    result: DragAndDropResult,
    nestedGroupData: NestedGroupingStructure[]
  ) => void;
  selectedFieldId?: string;
  builderConfig: FormBuilderConfig;
  closeSettings: (triggerAutosave?: boolean) => void;
}

const FormFields = ({
  onEditField,
  selectedFieldId,
  handleDragEnd,
  builderConfig,
  closeSettings,
}: FormFieldsProps) => {
  const { watch, trigger } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  const shouldShowField = (field: IFlatCustomField) => {
    if (builtInFieldKeys.includes(field.key)) {
      return field.enabled;
    }
    return true;
  };

  // We filter out the survey end because we add it manually at the end
  // (only relevant for survey, not for input form)
  const formCustomFieldsWithoutLastPage = formCustomFields.filter((field) => {
    return field.key !== 'survey_end';
  });

  // Also on relevant for survey
  const lastPage = formCustomFields[formCustomFields.length - 1];

  const nestedGroupData: NestedGroupingStructure[] = [];

  formCustomFieldsWithoutLastPage.forEach((field) => {
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

  const fieldNumbers = getFieldNumbers(formCustomFields);

  return (
    <Box height="100%" data-cy="e2e-form-fields">
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
                  selectedFieldId={selectedFieldId}
                  onEditField={onEditField}
                  builderConfig={builderConfig}
                  fieldNumbers={fieldNumbers}
                  closeSettings={closeSettings}
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
                                selectedFieldId={selectedFieldId}
                                onEditField={onEditField}
                                builderConfig={builderConfig}
                                fieldNumbers={fieldNumbers}
                                closeSettings={closeSettings}
                              />
                            </Drag>
                          ) : (
                            <Box key={question.id} height="1px" />
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
      {lastPage.key === 'survey_end' && (
        <Box>
          <FormField
            field={lastPage}
            selectedFieldId={selectedFieldId}
            onEditField={onEditField}
            builderConfig={builderConfig}
            fieldNumbers={fieldNumbers}
            closeSettings={closeSettings}
          />
        </Box>
      )}
      {formCustomFields.length > 0 && (
        <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
      )}
    </Box>
  );
};

export default FormFields;
