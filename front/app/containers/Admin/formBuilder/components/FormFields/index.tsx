import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';

// components
import { FieldElement } from './FieldElement';

// hooks and services
import useLocale from 'hooks/useLocale';
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

import { DragAndDrop, Drag, Drop } from '../DragAndDrop';
import {
  DragAndDropResult,
  PageStructure,
} from '../../containers/projects/forms/edit/utils';

// Assign field badge text
const getTranslatedFieldType = (field) => {
  switch (field) {
    case 'text':
      return messages.shortAnswer;
    case 'multiline_text':
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
    nestedPageData: PageStructure[]
  ) => void;
  isEditingDisabled: boolean;
  selectedFieldId?: string;
}

const FormFields = ({
  onEditField,
  selectedFieldId,
  isEditingDisabled,
  handleDragEnd,
}: FormFieldsProps) => {
  const { watch, trigger } = useFormContext();
  const locale = useLocale();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locale)) {
    return null;
  }

  const nestedPageData: PageStructure[] = [];
  formCustomFields.forEach((field) => {
    if (field.input_type === 'page') {
      nestedPageData.push({
        page: field,
        questions: [],
        id: field.id,
      });
    } else {
      const lastPage = nestedPageData[nestedPageData.length - 1];
      lastPage.questions.push({
        ...field,
      });
    }
  });

  return (
    <Box height="100%">
      <DragAndDrop
        onDragEnd={(result: DragAndDropResult) => {
          handleDragEnd(result, nestedPageData);
          trigger();
        }}
      >
        <Drop id="droppable" type={pageDNDType}>
          {nestedPageData.map((pageGrouping, pageIndex) => {
            return (
              <Drag
                key={pageGrouping.id}
                id={pageGrouping.id}
                index={pageIndex}
              >
                <FieldElement
                  field={pageGrouping.page}
                  isEditingDisabled={isEditingDisabled}
                  getTranslatedFieldType={getTranslatedFieldType}
                  selectedFieldId={selectedFieldId}
                  onEditField={onEditField}
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
