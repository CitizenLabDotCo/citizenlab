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

import {
  detectConflictsByPage,
  DragAndDropResult,
  NestedGroupingStructure,
} from '../../edit/utils';
import { DragAndDrop, Drag, Drop } from '../DragAndDrop';
import { getFieldNumbers } from '../utils';

import { pageDNDType, questionDNDType } from './constants';
import { FormField } from './FormField';

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

const individualPageFieldCodes = ['title_multiloc', 'body_multiloc'];

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

  const lastPage = formCustomFields[formCustomFields.length - 1];

  const nestedGroupData: NestedGroupingStructure[] = [];

  formCustomFields.forEach((field) => {
    if (field.input_type === 'page') {
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

  const conflictsByPage = detectConflictsByPage(nestedGroupData);
  const fieldNumbers = getFieldNumbers(formCustomFields);
  const userFieldsInFormNotice = builderConfig.getUserFieldsNotice;

  return (
    <>
      <Box
        borderRadius="3px"
        boxShadow="0px 2px 4px rgba(0, 0, 0, 0.2)"
        bgColor="white"
        minHeight="300px"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box height="100%" data-cy="e2e-form-fields">
          <DragAndDrop
            onDragEnd={(result: DragAndDropResult) => {
              handleDragEnd(result, nestedGroupData);
              trigger();
            }}
          >
            <Drop id="droppable" type={pageDNDType}>
              {nestedGroupData.map((grouping, pageIndex) => {
                if (
                  lastPage.key === 'form_end' &&
                  grouping.id === lastPage.id
                ) {
                  // Skip rendering FormField for last page, as it's rendered separately
                  // (see below)
                  return null;
                }
                // We don't want to allow dropping on the grouping (page) with individualPageFieldCodes
                // fields (e.g. title, description for now). These should be on their own pages
                const isDropDisabled = grouping.questions.some((question) =>
                  individualPageFieldCodes.includes(question.code || '')
                );

                return (
                  <Drag key={grouping.id} id={grouping.id} index={pageIndex}>
                    <FormField
                      field={grouping.groupElement}
                      selectedFieldId={selectedFieldId}
                      onEditField={onEditField}
                      builderConfig={builderConfig}
                      fieldNumbers={fieldNumbers}
                      closeSettings={closeSettings}
                      conflicts={conflictsByPage[grouping.groupElement.id]}
                      hasFullPageRestriction={isDropDisabled}
                    />
                    <Drop
                      key={grouping.id}
                      id={grouping.id}
                      type={questionDNDType}
                      isDropDisabled={isDropDisabled}
                    >
                      <Box height="100%">
                        {grouping.questions.length === 0 ? (
                          <Box height="0.5px" />
                        ) : (
                          <>
                            {grouping.questions.map((question, index) => {
                              const isDragDisabled =
                                individualPageFieldCodes.includes(
                                  question.code || ''
                                );
                              return shouldShowField(question) ? (
                                <Drag
                                  key={question.id}
                                  id={question.id}
                                  index={index}
                                  isDragDisabled={isDragDisabled}
                                >
                                  <FormField
                                    key={question.id}
                                    field={question}
                                    selectedFieldId={selectedFieldId}
                                    onEditField={onEditField}
                                    builderConfig={builderConfig}
                                    fieldNumbers={fieldNumbers}
                                    closeSettings={closeSettings}
                                    hasFullPageRestriction={isDragDisabled}
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
          {formCustomFields.length > 0 && (
            <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
          )}
        </Box>
        {lastPage.key === 'form_end' && (
          <>
            {userFieldsInFormNotice && userFieldsInFormNotice()}
            <Box mt={userFieldsInFormNotice ? '0' : '40px'}>
              <FormField
                field={lastPage}
                selectedFieldId={selectedFieldId}
                onEditField={onEditField}
                builderConfig={builderConfig}
                fieldNumbers={fieldNumbers}
                closeSettings={closeSettings}
                hasFullPageRestriction={false}
              />
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default FormFields;
